import fs from 'node:fs';
import crypto from 'node:crypto';

const queuePath = new URL('../distribution/social-queue.json', import.meta.url);
const policyPath = new URL('../distribution/winner-gate.json', import.meta.url);
const evidencePath = new URL('../distribution/revenue-evidence.jsonl', import.meta.url);
const outputPath = new URL('../distribution/winner-gate-state.json', import.meta.url);

const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));

function readJsonl(path) {
  if (!fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSONL at line ${index + 1}: ${error.message}`);
      }
    });
}

const evidence = readJsonl(evidencePath);

const rank = new Map([
  ['PREPARED', 0],
  ['PUBLISHED', 1],
  ['TRAFFIC_CONFIRMED', 2],
  ['BUYER_ACTION', 3],
  ['CHECKOUT', 4],
  ['PURCHASED', 5],
  ['WINNER', 6]
]);

function maxState(a, b) {
  return (rank.get(b) ?? -1) > (rank.get(a) ?? -1) ? b : a;
}

function eventState(eventName) {
  switch (eventName) {
    case 'traffic_session_start':
      return 'TRAFFIC_CONFIRMED';
    case 'free_tool_start':
    case 'free_tool_complete':
    case 'paid_product_view':
    case 'primary_cta_click':
    case 'checkout_click':
      return 'BUYER_ACTION';
    case 'confirmed_checkout_departure':
    case 'checkout_return':
      return 'CHECKOUT';
    case 'verified_access':
      return 'PURCHASED';
    case 'purchase':
      return 'WINNER';
    default:
      return null;
  }
}

function matches(item, event) {
  if (event.social_item_id && event.social_item_id === item.id) return true;
  if (event.external_post_id && item.external_post_id && event.external_post_id === item.external_post_id) return true;

  const itemRoute = item.utm?.route_id || null;
  const itemContent = item.utm?.utm_content || null;
  if (event.route_id && event.utm_content && itemRoute && itemContent) {
    return event.route_id === itemRoute && event.utm_content === itemContent;
  }

  return false;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value || '').digest('hex');
}

function summarize(item) {
  let state = item.status === 'PUBLISHED' && item.external_post_id ? 'PUBLISHED' : 'PREPARED';
  const matched = evidence.filter((event) => matches(item, event));
  const accepted = [];

  for (const event of matched) {
    const next = eventState(event.event);
    if (!next) continue;
    state = maxState(state, next);
    accepted.push({
      event: event.event,
      observed_at: event.observed_at || null,
      evidence_ref: event.evidence_ref || null
    });
  }

  const purchaseConfirmed = accepted.some((x) => x.event === 'purchase');
  const checkoutConfirmed = accepted.some((x) => ['confirmed_checkout_departure', 'checkout_return'].includes(x.event));
  const buyerActionConfirmed = accepted.some((x) => ['free_tool_start', 'free_tool_complete', 'paid_product_view', 'primary_cta_click', 'checkout_click'].includes(x.event));
  const trafficConfirmed = accepted.some((x) => x.event === 'traffic_session_start');

  const decision = purchaseConfirmed
    ? 'WINNER'
    : checkoutConfirmed
      ? 'STRONG_WINNER_CANDIDATE'
      : buyerActionConfirmed
        ? 'BUYER_ACTION_CANDIDATE'
        : trafficConfirmed
          ? 'TRAFFIC_ONLY'
          : item.status === 'PUBLISHED' && item.external_post_id
            ? 'PUBLISHED_NO_DOWNSTREAM_EVIDENCE'
            : 'NOT_PUBLISHED';

  return {
    social_item_id: item.id,
    platform: item.platform,
    external_post_id: item.external_post_id || null,
    external_post_url: item.external_post_url || null,
    published_at: item.published_at || null,
    destination_url: item.destination || queue.destination || null,
    route_id: item.utm?.route_id || null,
    asset_id: item.utm?.asset_id || item.media_asset_id || null,
    utm_source: item.utm?.utm_source || null,
    utm_medium: item.utm?.utm_medium || null,
    utm_campaign: item.utm?.utm_campaign || null,
    utm_content: item.utm?.utm_content || null,
    copy_hash: sha256(item.copy || ''),
    state,
    decision,
    evidence_count: accepted.length,
    evidence: accepted,
    amplification_eligible: purchaseConfirmed,
    amplification_plan: purchaseConfirmed ? {
      min_variants: policy.winner_amplification?.min_variants ?? 5,
      max_variants: policy.winner_amplification?.max_variants ?? 20,
      keep_fixed: policy.winner_amplification?.keep_fixed || ['offer', 'route_id'],
      vary: policy.winner_amplification?.vary || ['hook', 'problem', 'evidence', 'cta', 'timing'],
      separate_by: policy.winner_amplification?.separate_by || ['asset_id', 'utm_content']
    } : null
  };
}

const items = queue.items.map(summarize);
const winners = items.filter((item) => item.amplification_eligible);

const output = {
  version: 1,
  evaluated_at: new Date().toISOString(),
  campaign: queue.campaign || null,
  invariant: 'PUBLISHED != WINNER',
  evidence_file: 'distribution/revenue-evidence.jsonl',
  winner_count: winners.length,
  winner_ids: winners.map((item) => item.social_item_id),
  items
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({winner_count: output.winner_count, winner_ids: output.winner_ids}, null, 2));
