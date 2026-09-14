import fs from 'node:fs';
import { blueskyConfigured, publishBluesky } from './social-provider-bluesky.mjs';

const probePath = new URL('../distribution/revenue-pump-qualified-traffic.json', import.meta.url);
const evidencePath = new URL('../distribution/revenue-pump-qualified-traffic-last-run.json', import.meta.url);
const readmePath = new URL('../README.md', import.meta.url);
const probe = JSON.parse(fs.readFileSync(probePath, 'utf8'));

// External redirectors are denied by default. This map is deliberately exact and
// only contains redirects whose destination was independently verified when created.
const approvedEvidenceRedirects = new Map([
  ['https://linkly.link/2t7wy', 'https://vector-praxis-japan.vercel.app'],
]);

const approvedVectorProductionOrigins = new Set([
  'https://vector-praxis-japan.vercel.app',
]);

function writeJson(path, value) {
  fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function buildTrackedUrl(base, params = {}) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function readCanonicalOrigin() {
  const readme = fs.readFileSync(readmePath, 'utf8');
  const match = readme.match(/Current public URL:\s*(https:\/\/\S+)/);
  if (!match?.[1]) throw new Error('canonical_public_url_missing_from_readme');
  return new URL(match[1]).origin;
}

const baseEvidence = {
  observed_at: new Date().toISOString(),
  id: probe.id,
  platform: probe.platform,
  route_id: probe.route_id,
  asset_id: probe.asset_id,
};

if (probe.status !== 'READY' || probe.approval !== 'USER_APPROVED') {
  console.log(JSON.stringify({
    ...baseEvidence,
    status: 'NO_DUE_QUALIFIED_TRAFFIC_PROBE',
    probe_status: probe.status,
    approval: probe.approval,
  }, null, 2));
  process.exit(0);
}

if (probe.platform !== 'bluesky') {
  const evidence = {...baseEvidence, status: 'FAILED_REVIEW', reason: `unsupported_platform:${probe.platform}`};
  writeJson(evidencePath, evidence);
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
}

let canonicalOrigin;
let destinationUrl;
let destinationOrigin;
try {
  canonicalOrigin = readCanonicalOrigin();
  destinationUrl = new URL(probe.destination);
  destinationOrigin = destinationUrl.origin;
} catch (error) {
  const evidence = {
    ...baseEvidence,
    status: 'FAILED_REVIEW',
    reason: String(error?.message || error || 'invalid_destination_or_canonical_origin'),
  };
  writeJson(evidencePath, evidence);
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
}

const approvedDirectOrigins = new Set([canonicalOrigin, ...approvedVectorProductionOrigins]);
let destinationValidation = {
  mode: 'direct',
  destination_origin: destinationOrigin,
  canonical_origin: canonicalOrigin,
};

if (!approvedDirectOrigins.has(destinationOrigin)) {
  const assertedFinalOrigin = approvedEvidenceRedirects.get(destinationUrl.toString());
  if (!assertedFinalOrigin || !approvedDirectOrigins.has(assertedFinalOrigin)) {
    const evidence = {
      ...baseEvidence,
      status: 'FAILED_REVIEW',
      reason: 'destination_origin_mismatch',
      destination_origin: destinationOrigin,
      canonical_origin: canonicalOrigin,
      approved_production_origins: [...approvedVectorProductionOrigins],
    };
    writeJson(evidencePath, evidence);
    console.error(JSON.stringify(evidence, null, 2));
    process.exit(1);
  }
  destinationValidation = {
    mode: 'approved_exact_evidence_redirect',
    redirect_url: destinationUrl.toString(),
    asserted_final_origin: assertedFinalOrigin,
    canonical_origin: canonicalOrigin,
  };
}

if (!blueskyConfigured()) {
  const evidence = {...baseEvidence, status: 'READY_BUT_NOT_CONNECTED', provider: 'bluesky_direct', destination_validation: destinationValidation};
  writeJson(evidencePath, evidence);
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
}

const trackedUrl = buildTrackedUrl(probe.destination, {
  ...(probe.utm || {}),
  route_id: probe.route_id,
  asset_id: probe.asset_id,
});
const text = `${probe.copy}\n\n${trackedUrl}`;

try {
  const published = await publishBluesky({
    item: {
      ...probe,
      require_media: false,
      media_url: null,
      media_type: null,
    },
    text,
    trackedUrl,
  });

  if (!published?.external_post_id) throw new Error('bluesky_missing_external_post_id');

  probe.status = 'PUBLISHED';
  probe.external_post_id = String(published.external_post_id);
  probe.external_post_url = published.external_post_url || null;
  probe.published_at = published.published_at || new Date().toISOString();
  probe.publisher = published.publisher || 'bluesky_direct';
  probe.tracked_url = trackedUrl;
  writeJson(probePath, probe);

  const evidence = {
    ...baseEvidence,
    status: 'PUBLISHED_CONFIRMED_BY_PUBLISHER',
    tracked_url: trackedUrl,
    external_post_id: probe.external_post_id,
    external_post_url: probe.external_post_url,
    published_at: probe.published_at,
    publisher: probe.publisher,
    destination_validation: destinationValidation,
  };
  writeJson(evidencePath, evidence);
  console.log(JSON.stringify(evidence, null, 2));
} catch (error) {
  probe.status = 'FAILED_REVIEW';
  probe.last_error = String(error?.message || error || 'unknown');
  probe.last_error_at = new Date().toISOString();
  writeJson(probePath, probe);

  const evidence = {
    ...baseEvidence,
    status: 'FAILED_REVIEW',
    tracked_url: trackedUrl,
    reason: probe.last_error,
    destination_validation: destinationValidation,
  };
  writeJson(evidencePath, evidence);
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
}
