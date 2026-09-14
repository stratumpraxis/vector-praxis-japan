import fs from 'node:fs';
import {blueskyConfigured, publishBluesky} from './social-provider-bluesky.mjs';

const routeProofPath = new URL('../distribution/vector-public-route-proof.json', import.meta.url);
const evidencePath = new URL('../distribution/vector-revenue-probe-evidence.json', import.meta.url);
const routeProof = JSON.parse(fs.readFileSync(routeProofPath, 'utf8'));
const existing = fs.existsSync(evidencePath) ? JSON.parse(fs.readFileSync(evidencePath, 'utf8')) : null;

const PROBE_ID = 'vp-ai-agent-bottleneck-bluesky-20260914-04';
const ROUTE_ID = 'vpj_owned_ai_agent_bottleneck_v2';
const ASSET_ID = 'ai_agent_bottleneck';

function persist(payload) {
  fs.writeFileSync(evidencePath, `${JSON.stringify(payload, null, 2)}\n`);
}

if (existing?.id === PROBE_ID && existing?.status === 'PUBLISHED_CONFIRMED_BY_PUBLISHER' && existing?.external_post_id) {
  console.log(JSON.stringify({status: 'ALREADY_PUBLISHED', external_post_id: existing.external_post_id}, null, 2));
  process.exit(0);
}

const routeReachable = ['REACHABLE', 'ROUTE_REACHABLE_ANALYTICS_UNVERIFIED'].includes(routeProof?.evidence_state);
if (!routeReachable || !routeProof?.selected_url) {
  const payload = {
    id: PROBE_ID,
    status: 'BLOCKED_ROUTE_UNVERIFIED',
    checked_at: new Date().toISOString(),
    route_id: ROUTE_ID,
    asset_id: ASSET_ID,
    route_evidence_state: routeProof?.evidence_state || 'UNVERIFIED'
  };
  persist(payload);
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

if (!blueskyConfigured()) {
  const payload = {
    id: PROBE_ID,
    status: 'READY_BUT_NOT_CONNECTED',
    checked_at: new Date().toISOString(),
    platform: 'bluesky',
    route_id: ROUTE_ID,
    asset_id: ASSET_ID
  };
  persist(payload);
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

const tracked = new URL(routeProof.selected_url);
tracked.searchParams.set('utm_source', 'bluesky');
tracked.searchParams.set('utm_medium', 'social');
tracked.searchParams.set('utm_campaign', 'vab14');
tracked.searchParams.set('utm_content', 'coord_judge_v2');
tracked.searchParams.set('asset_id', ASSET_ID);
tracked.searchParams.set('route_id', ROUTE_ID);

const trackedUrl = tracked.toString();
const copy = 'ChatGPT・Claude・GitHubを増やしたのに、確認・引き継ぎ・判断で仕事が止まる。詰まりを3択の無料診断で切り分けます。30秒で確認 →';
const text = `${copy}\n\n${trackedUrl}`;
const item = {
  id: PROBE_ID,
  platform: 'bluesky',
  require_media: false,
  post_format: 'text'
};

try {
  const published = await publishBluesky({item, text, trackedUrl});
  if (!published?.external_post_id) throw new Error('publisher_missing_external_post_id');
  const payload = {
    id: PROBE_ID,
    status: 'PUBLISHED_CONFIRMED_BY_PUBLISHER',
    platform: 'bluesky',
    publisher: published.publisher || 'bluesky_direct',
    external_post_id: String(published.external_post_id),
    external_post_url: published.external_post_url || null,
    published_at: published.published_at || new Date().toISOString(),
    destination: routeProof.selected_url,
    tracked_url: trackedUrl,
    route_id: ROUTE_ID,
    asset_id: ASSET_ID,
    utm: {
      utm_source: 'bluesky',
      utm_medium: 'social',
      utm_campaign: 'vab14',
      utm_content: 'coord_judge_v2'
    },
    route_proof: {
      evidence_state: routeProof.evidence_state,
      checked_at: routeProof.checked_at,
      workflow_run_id: routeProof.workflow_run_id
    },
    inference_guard: 'Publication evidence does not imply traffic, checkout, purchase, or revenue.'
  };
  persist(payload);
  console.log(JSON.stringify(payload, null, 2));
} catch (error) {
  const payload = {
    id: PROBE_ID,
    status: 'FAILED_REVIEW',
    platform: 'bluesky',
    failed_at: new Date().toISOString(),
    reason: `bluesky_direct_error:${error?.message || 'unknown'}`,
    destination: routeProof.selected_url,
    tracked_url: trackedUrl,
    route_id: ROUTE_ID,
    asset_id: ASSET_ID
  };
  persist(payload);
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}
