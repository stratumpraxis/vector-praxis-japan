import fs from 'node:fs';
import {blueskyConfigured, publishBluesky} from './social-provider-bluesky.mjs';
import {instagramConfigured, publishInstagram} from './social-provider-instagram.mjs';

const queuePath = new URL('../distribution/social-queue.json', import.meta.url);
const lastRunPath = new URL('../distribution/social-last-run.json', import.meta.url);
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const now = new Date();
const results = [];

function persistQueue() {
  fs.writeFileSync(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
}

function persistLastRun(extra = {}) {
  fs.writeFileSync(lastRunPath, `${JSON.stringify({
    observed_at: new Date().toISOString(),
    campaign: queue.campaign,
    results,
    ...extra
  }, null, 2)}\n`);
}

function buildTrackedUrl(base, utm) {
  const url = new URL(base);
  for (const [k, v] of Object.entries(utm || {})) url.searchParams.set(k, v);
  return url.toString();
}

function eligible(item) {
  if (item.status !== 'READY') return false;
  if (item.approval !== 'USER_APPROVED') return false;
  if (!item.scheduled_at) return false;
  if (queue.policy?.disabled_platforms?.includes(item.platform)) return false;
  return new Date(item.scheduled_at) <= now;
}

function markPublished(due, payload) {
  delete due.last_error;
  delete due.last_error_at;
  due.status = 'PUBLISHED';
  due.external_post_id = String(payload.external_post_id);
  due.external_post_url = payload.external_post_url || null;
  due.published_at = payload.published_at || new Date().toISOString();
  due.publisher = payload.publisher || 'unknown';
  results.push({
    status: 'PUBLISHED_CONFIRMED_BY_PUBLISHER',
    id: due.id,
    platform: due.platform,
    external_post_id: due.external_post_id,
    external_post_url: due.external_post_url,
    publisher: due.publisher
  });
}

function markFailed(due, reason, extra = {}) {
  due.status = 'FAILED_REVIEW';
  due.last_error = reason;
  due.last_error_at = new Date().toISOString();
  results.push({status: 'FAILED_REVIEW', id: due.id, platform: due.platform, reason, ...extra});
}

const dueItems = queue.items.filter(eligible).slice(0, queue.policy?.max_items_per_run || 1);
if (!dueItems.length) {
  results.push({status: 'NO_DUE_SOCIAL_POSTS'});
  persistLastRun();
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

const webhook = process.env.SOCIAL_PUBLISH_WEBHOOK_URL;
const retryAfter = queue.publisher_state?.retry_after ? new Date(queue.publisher_state.retry_after) : null;

for (const due of dueItems) {
  const destination = due.destination || queue.destination;
  const trackedUrl = buildTrackedUrl(destination, due.utm);
  const tags = (due.hashtags || []).map((x) => `#${x}`).join(' ');
  const text = `${due.copy}\n\n${trackedUrl}${tags ? `\n\n${tags}` : ''}`;

  if (due.require_media && !due.media_url) {
    markFailed(due, 'required_media_url_missing');
    continue;
  }

  if (due.platform === 'bluesky') {
    if (!blueskyConfigured()) {
      results.push({status: 'READY_BUT_NOT_CONNECTED', id: due.id, platform: due.platform, provider: 'bluesky_direct'});
      continue;
    }
    try {
      const payload = await publishBluesky({item: due, text, trackedUrl});
      if (!payload?.external_post_id) {
        markFailed(due, 'bluesky_missing_external_post_id');
        continue;
      }
      markPublished(due, payload);
    } catch (error) {
      markFailed(due, `bluesky_direct_error:${error?.message || 'unknown'}`);
    }
    continue;
  }

  if (due.platform === 'instagram') {
    if (!instagramConfigured()) {
      results.push({status: 'READY_BUT_NOT_CONNECTED', id: due.id, platform: due.platform, provider: 'instagram_direct'});
      continue;
    }
    try {
      const payload = await publishInstagram({item: due, text, trackedUrl});
      if (!payload?.external_post_id) {
        markFailed(due, 'instagram_missing_external_post_id');
        continue;
      }
      markPublished(due, payload);
    } catch (error) {
      markFailed(due, `instagram_direct_error:${error?.message || 'unknown'}`);
    }
    continue;
  }

  // Legacy webhook is retained only for platforms that do not yet have a direct route.
  // Its cooldown must not block a healthy direct provider such as Bluesky or Instagram.
  if (retryAfter && retryAfter > now) {
    results.push({
      status: 'PUBLISHER_COOLDOWN',
      id: due.id,
      platform: due.platform,
      provider: 'legacy_webhook',
      retry_after: retryAfter.toISOString(),
      last_http_status: queue.publisher_state?.http_status || null
    });
    continue;
  }

  if (!webhook) {
    results.push({status: 'READY_BUT_NOT_CONNECTED', id: due.id, platform: due.platform, provider: 'legacy_webhook'});
    continue;
  }

  let response;
  try {
    response = await fetch(webhook, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        brand: queue.policy.brand,
        campaign: queue.campaign,
        id: due.id,
        platform: due.platform,
        text,
        caption: due.copy,
        hashtags: due.hashtags || [],
        destination_url: trackedUrl,
        scheduled_at: due.scheduled_at,
        publish_now: true,
        media_url: due.media_url || null,
        media_type: due.media_type || null,
        media_asset_id: due.media_asset_id || null,
        post_format: due.post_format || null
      })
    });
  } catch (error) {
    markFailed(due, `publisher_network_error:${error?.message || 'unknown'}`);
    continue;
  }

  if (response.status === 410) {
    const retry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    queue.publisher_state = {
      status: 'PUBLISHER_GONE',
      http_status: 410,
      observed_at: new Date().toISOString(),
      retry_after: retry.toISOString()
    };
    markFailed(due, 'publisher_http_410', {http_status: 410, retry_after: retry.toISOString()});
    continue;
  }

  if (!response.ok) {
    markFailed(due, `publisher_http_${response.status}`, {http_status: response.status});
    continue;
  }

  const payload = await response.json().catch(() => ({}));
  if (!payload.external_post_id) {
    markFailed(due, 'publisher_missing_external_post_id');
    continue;
  }

  markPublished(due, {
    external_post_id: payload.external_post_id,
    external_post_url: payload.external_post_url || payload.public_url || payload.url || null,
    published_at: payload.published_at || new Date().toISOString(),
    publisher: payload.publisher || 'webhook'
  });
}

persistQueue();
persistLastRun();
console.log(JSON.stringify(results, null, 2));
