import fs from 'node:fs';

const queuePath = new URL('../distribution/social-queue.json', import.meta.url);
const lastRunPath = new URL('../distribution/bluesky-direct-last-run.json', import.meta.url);
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const now = new Date();
const results = [];

function persist() {
  fs.writeFileSync(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
  fs.writeFileSync(lastRunPath, `${JSON.stringify({
    observed_at: new Date().toISOString(),
    campaign: queue.campaign,
    results,
  }, null, 2)}\n`);
}

function buildTrackedUrl(base, utm) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(utm || {})) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function eligible(item) {
  if (item.platform !== 'bluesky') return false;
  if (item.publisher_route !== 'bluesky_direct') return false;
  if (item.status !== 'READY') return false;
  if (item.approval !== 'USER_APPROVED') return false;
  if (!item.scheduled_at) return false;
  if (queue.policy?.disabled_platforms?.includes(item.platform)) return false;
  return new Date(item.scheduled_at) <= now;
}

function makeLinkFacet(text, url) {
  const start = text.indexOf(url);
  if (start < 0) return null;
  const byteStart = Buffer.byteLength(text.slice(0, start), 'utf8');
  const byteEnd = byteStart + Buffer.byteLength(url, 'utf8');
  return {
    index: { byteStart, byteEnd },
    features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
  };
}

async function jsonOrText(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 1000) };
  }
}

const dueItems = queue.items.filter(eligible).slice(0, 1);
if (!dueItems.length) {
  results.push({ status: 'NO_DUE_BLUESKY_DIRECT_POSTS' });
  persist();
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

const appPassword = process.env.BLUESKY_APP_PASSWORD;
const envHandle = process.env.BLUESKY_HANDLE;
if (!appPassword) {
  for (const item of dueItems) {
    results.push({
      status: 'READY_BUT_AUTH_REQUIRED',
      id: item.id,
      platform: item.platform,
      required_secret: 'BLUESKY_APP_PASSWORD',
    });
  }
  persist();
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

for (const item of dueItems) {
  if (item.require_media) {
    results.push({
      status: 'FAILED_REVIEW',
      id: item.id,
      platform: item.platform,
      reason: 'bluesky_direct_text_route_does_not_degrade_media_required_item',
    });
    continue;
  }

  const handle = envHandle || item.account_handle;
  if (!handle) {
    results.push({ status: 'FAILED_REVIEW', id: item.id, platform: item.platform, reason: 'bluesky_handle_missing' });
    continue;
  }

  const sessionResponse = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: handle, password: appPassword }),
  });
  const session = await jsonOrText(sessionResponse);
  if (!sessionResponse.ok || !session?.accessJwt || !session?.did) {
    results.push({
      status: 'AUTH_FAILED',
      id: item.id,
      platform: item.platform,
      http_status: sessionResponse.status,
    });
    continue;
  }

  const destination = item.destination || queue.destination;
  const trackedUrl = buildTrackedUrl(destination, item.utm);
  const tags = (item.hashtags || []).map((tag) => `#${tag}`).join(' ');
  const text = `${item.copy}\n\n${trackedUrl}${tags ? `\n\n${tags}` : ''}`;

  const graphemeCount = [...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text)].length;
  if (graphemeCount > 300) {
    results.push({
      status: 'FAILED_REVIEW',
      id: item.id,
      platform: item.platform,
      reason: 'bluesky_grapheme_limit_exceeded',
      grapheme_count: graphemeCount,
    });
    continue;
  }

  const facet = makeLinkFacet(text, trackedUrl);
  const record = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
    langs: ['ja'],
    ...(facet ? { facets: [facet] } : {}),
  };

  const postResponse = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record,
    }),
  });
  const posted = await jsonOrText(postResponse);

  if (!postResponse.ok || !posted?.uri) {
    results.push({
      status: 'PUBLISH_FAILED',
      id: item.id,
      platform: item.platform,
      http_status: postResponse.status,
    });
    continue;
  }

  const rkey = String(posted.uri).split('/').pop();
  const publicUrl = rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : null;

  item.status = 'PUBLISHED';
  item.external_post_id = String(posted.uri);
  item.external_post_url = publicUrl;
  item.published_at = new Date().toISOString();
  item.publisher = 'bluesky_direct';
  delete item.last_error;
  delete item.last_error_at;

  results.push({
    status: 'PUBLISHED_CONFIRMED_BY_BLUESKY',
    id: item.id,
    platform: item.platform,
    external_post_id: item.external_post_id,
    external_post_url: item.external_post_url,
  });
}

persist();
console.log(JSON.stringify(results, null, 2));
