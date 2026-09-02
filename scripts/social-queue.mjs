import fs from 'node:fs';

const queuePath = new URL('../distribution/social-queue.json', import.meta.url);
const handoffDir = new URL('../distribution/handoffs/', import.meta.url);
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const now = new Date();

function persist() {
  fs.writeFileSync(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
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

function handoffBlockedPublish({due, trackedUrl, text, blocker, evidence = {}, nextOwner = 'ALTERNATE_PUBLISHER_AGENT'}) {
  fs.mkdirSync(handoffDir, {recursive: true});
  const handoffPath = `distribution/handoffs/${due.id}.json`;
  const handoffFile = new URL(`../${handoffPath}`, import.meta.url);
  const payload = {
    version: 1,
    generated_at: now.toISOString(),
    input: {
      brand: queue.policy?.brand || null,
      campaign: queue.campaign,
      id: due.id,
      platform: due.platform,
      text,
      destination_url: trackedUrl,
      scheduled_at: due.scheduled_at
    },
    action: 'PUBLISH_SOCIAL_POST',
    result: 'BLOCKED_HANDOFF_CREATED',
    evidence,
    blocker,
    next_owner: nextOwner,
    next_action: 'Publish this exact payload through another connected route, verify the public URL, then update the queue item to PUBLISHED with external_post_id/public_url/published_at. Do not redesign the campaign.'
  };

  fs.writeFileSync(handoffFile, `${JSON.stringify(payload, null, 2)}\n`);
  due.status = 'HANDOFF_REQUIRED';
  due.handoff_path = handoffPath;
  due.last_error = blocker;
  due.last_error_at = now.toISOString();
  persist();

  console.error(JSON.stringify(payload, null, 2));
}

const retryAfter = queue.publisher_state?.retry_after ? new Date(queue.publisher_state.retry_after) : null;
if (retryAfter && retryAfter > now) {
  console.log(JSON.stringify({status:'PUBLISHER_COOLDOWN', retry_after:retryAfter.toISOString(), last_http_status:queue.publisher_state.http_status || null}, null, 2));
  process.exit(0);
}

const due = queue.items.find(eligible);
if (!due) {
  console.log('No due social posts.');
  process.exit(0);
}

const trackedUrl = buildTrackedUrl(queue.destination, due.utm);
const text = `${due.copy}\n\n${trackedUrl}\n\n${due.hashtags.map((x) => `#${x}`).join(' ')}`;
const webhook = process.env.SOCIAL_PUBLISH_WEBHOOK_URL;

if (!webhook) {
  handoffBlockedPublish({
    due,
    trackedUrl,
    text,
    blocker: 'publisher_not_connected',
    evidence: {status: 'READY_BUT_NOT_CONNECTED'}
  });
  process.exit(2);
}

const response = await fetch(webhook, {
  method: 'POST',
  headers: {'content-type':'application/json'},
  body: JSON.stringify({
    brand: queue.policy.brand,
    campaign: queue.campaign,
    id: due.id,
    platform: due.platform,
    text,
    destination_url: trackedUrl,
    scheduled_at: due.scheduled_at
  })
});

if (response.status === 410) {
  const retry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  queue.publisher_state = {
    status: 'PUBLISHER_GONE',
    http_status: 410,
    observed_at: now.toISOString(),
    retry_after: retry.toISOString()
  };
  handoffBlockedPublish({
    due,
    trackedUrl,
    text,
    blocker: 'publisher_http_410',
    evidence: {http_status: 410, retry_after: retry.toISOString()}
  });
  process.exit(2);
}

if (!response.ok) {
  console.error(`Publisher returned ${response.status}`);
  process.exit(1);
}

const payload = await response.json().catch(() => ({}));
if (!payload.external_post_id) {
  console.error('Publisher did not return external_post_id; refusing to mark published.');
  process.exit(1);
}

delete queue.publisher_state;
due.status = 'PUBLISHED';
due.external_post_id = String(payload.external_post_id);
due.public_url = payload.public_url || null;
due.published_at = payload.published_at || new Date().toISOString();
due.publisher = payload.publisher || 'webhook';
persist();

console.log(JSON.stringify({status:'PUBLISHED_CONFIRMED_BY_PUBLISHER', id:due.id, external_post_id:due.external_post_id, public_url:due.public_url}, null, 2));
