import fs from 'node:fs';

const queuePath = new URL('../distribution/social-queue.json', import.meta.url);
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const now = new Date();

function buildTrackedUrl(base, utm) {
  const url = new URL(base);
  for (const [k, v] of Object.entries(utm || {})) url.searchParams.set(k, v);
  return url.toString();
}

function eligible(item) {
  if (item.status !== 'READY') return false;
  if (item.approval !== 'USER_APPROVED') return false;
  if (!item.scheduled_at) return false;
  return new Date(item.scheduled_at) <= now;
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
  console.log(JSON.stringify({status:'READY_BUT_NOT_CONNECTED', id:due.id, platform:due.platform, text}, null, 2));
  process.exit(0);
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

if (!response.ok) {
  console.error(`Publisher returned ${response.status}`);
  process.exit(1);
}

const payload = await response.json().catch(() => ({}));
if (!payload.external_post_id) {
  console.error('Publisher did not return external_post_id; refusing to mark published.');
  process.exit(1);
}

console.log(JSON.stringify({status:'PUBLISHED_CONFIRMED_BY_PUBLISHER', id:due.id, external_post_id:payload.external_post_id}, null, 2));
