import fs from 'node:fs';
import crypto from 'node:crypto';

const evidencePath = new URL('../distribution/revenue-evidence.jsonl', import.meta.url);
const statePath = new URL('../distribution/posthog-evidence-sync-state.json', import.meta.url);
const queuePath = new URL('../distribution/social-queue.json', import.meta.url);
const contractPath = new URL('../config/vector-revenue-event-contract.json', import.meta.url);

const apiKey = process.env.POSTHOG_PERSONAL_API_KEY || '';
const projectId = process.env.POSTHOG_PROJECT_ID || '';
const apiHost = (process.env.POSTHOG_API_HOST || 'https://us.posthog.com').replace(/\/$/, '');
const queryWindowDays = Number.parseInt(process.env.POSTHOG_EVIDENCE_WINDOW_DAYS || '14', 10);

// Deliberately limited to analytics / first-party interaction evidence.
// Checkout confirmation and purchase must come from a provider-grade evidence source,
// not from this generic PostHog ingest path.
const allowedEvents = [
  'traffic_session_start',
  'free_tool_start',
  'free_tool_complete',
  'paid_product_view',
  'primary_cta_click',
  'checkout_click'
];

const excludedHighTrustEvents = [
  'confirmed_checkout_departure',
  'checkout_return',
  'verified_access',
  'purchase'
];

function stableHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

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
        throw new Error(`Invalid revenue evidence JSONL at line ${index + 1}: ${error.message}`);
      }
    });
}

function writeState(state) {
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const queue = readJson(queuePath);
const contract = readJson(contractPath);
const existing = readJsonl(evidencePath);

// The contract is authoritative for which Vector revenue route is currently active.
// The social queue contributes the exact utm_content values that can be attributed
// back to a confirmed published post. This prevents cross-project PostHog data from
// entering the Vector evidence ledger merely because it shares the same analytics project.
const currentRouteId = contract.current_route?.route_id || null;
const attributionTargets = queue.items
  .filter((item) => item.status === 'PUBLISHED' && item.external_post_id)
  .filter((item) => item.utm?.route_id && item.utm?.utm_content)
  .filter((item) => !currentRouteId || item.utm.route_id === currentRouteId)
  .map((item) => ({
    social_item_id: item.id,
    external_post_id: item.external_post_id,
    route_id: item.utm.route_id,
    utm_content: item.utm.utm_content
  }));

const uniqueTargetKeys = new Set(attributionTargets.map((target) => `${target.route_id}\u0000${target.utm_content}`));

function ledgerSummary(records, extra = {}) {
  const posthogRecords = records.filter((record) => record.source === 'posthog');
  const watermarks = posthogRecords
    .map((record) => record.observed_at)
    .filter(Boolean)
    .sort();

  return {
    version: 1,
    source: 'posthog',
    project_id: projectId || null,
    api_host: apiHost,
    current_route_id: currentRouteId,
    attribution_target_count: uniqueTargetKeys.size,
    allowed_events: allowedEvents,
    excluded_high_trust_events: excludedHighTrustEvents,
    evidence_record_count: posthogRecords.length,
    last_event_watermark: watermarks.at(-1) || null,
    ...extra
  };
}

if (!apiKey || !projectId) {
  writeState(ledgerSummary(existing, {
    status: 'READY_BUT_NOT_CONNECTED',
    missing: [
      ...(!apiKey ? ['POSTHOG_PERSONAL_API_KEY'] : []),
      ...(!projectId ? ['POSTHOG_PROJECT_ID'] : [])
    ]
  }));
  console.log(JSON.stringify({
    status: 'READY_BUT_NOT_CONNECTED',
    missing_api_key: !apiKey,
    missing_project_id: !projectId
  }, null, 2));
  process.exit(0);
}

if (!Number.isFinite(queryWindowDays) || queryWindowDays < 1 || queryWindowDays > 90) {
  throw new Error('POSTHOG_EVIDENCE_WINDOW_DAYS must be between 1 and 90');
}

if (!uniqueTargetKeys.size) {
  writeState(ledgerSummary(existing, {
    status: 'CONNECTED_NO_ATTRIBUTION_TARGETS',
    query_window_days: queryWindowDays
  }));
  console.log(JSON.stringify({
    status: 'CONNECTED_NO_ATTRIBUTION_TARGETS',
    current_route_id: currentRouteId
  }, null, 2));
  process.exit(0);
}

const targetConditions = [...uniqueTargetKeys]
  .map((key) => {
    const [routeId, utmContent] = key.split('\u0000');
    return `(properties.route_id = ${sqlString(routeId)} AND properties.utm_content = ${sqlString(utmContent)})`;
  })
  .join('\n    OR ');

const eventList = allowedEvents.map(sqlString).join(', ');
const hogql = `
SELECT
  timestamp,
  event,
  properties.route_id,
  properties.asset_id,
  properties.utm_source,
  properties.utm_medium,
  properties.utm_campaign,
  properties.utm_content,
  properties.destination_url
FROM events
WHERE timestamp >= now() - INTERVAL ${queryWindowDays} DAY
  AND event IN (${eventList})
  AND (
    ${targetConditions}
  )
ORDER BY timestamp ASC
LIMIT 500
`.trim();

let response;
try {
  response = await fetch(`${apiHost}/api/projects/${encodeURIComponent(projectId)}/query`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: hogql,
        name: 'Vector Revenue Evidence Sync'
      }
    })
  });
} catch (error) {
  writeState(ledgerSummary(existing, {
    status: 'QUERY_ERROR',
    error_class: 'NETWORK_ERROR',
    query_window_days: queryWindowDays
  }));
  console.error(`PostHog evidence sync network error: ${error?.message || 'unknown'}`);
  process.exit(0);
}

if (!response.ok) {
  writeState(ledgerSummary(existing, {
    status: 'QUERY_ERROR',
    error_class: `HTTP_${response.status}`,
    query_window_days: queryWindowDays
  }));
  console.error(`PostHog evidence sync HTTP ${response.status}`);
  process.exit(0);
}

const payload = await response.json().catch(() => null);
if (!payload || !Array.isArray(payload.results)) {
  writeState(ledgerSummary(existing, {
    status: 'QUERY_ERROR',
    error_class: 'INVALID_RESPONSE',
    query_window_days: queryWindowDays
  }));
  console.error('PostHog evidence sync returned an invalid response shape.');
  process.exit(0);
}

const columns = Array.isArray(payload.columns) ? payload.columns : [
  'timestamp',
  'event',
  'properties.route_id',
  'properties.asset_id',
  'properties.utm_source',
  'properties.utm_medium',
  'properties.utm_campaign',
  'properties.utm_content',
  'properties.destination_url'
];

function rowToObject(row) {
  if (!Array.isArray(row)) return row || {};
  return Object.fromEntries(columns.map((column, index) => [column, row[index] ?? null]));
}

function value(row, key, fallbackKey = null) {
  if (row[key] !== undefined) return row[key];
  if (fallbackKey && row[fallbackKey] !== undefined) return row[fallbackKey];
  return null;
}

const knownKeys = new Set(existing.map((record) => record.evidence_key).filter(Boolean));
const targetByKey = new Map(attributionTargets.map((target) => [`${target.route_id}\u0000${target.utm_content}`, target]));
const additions = [];

for (const rawRow of payload.results) {
  const row = rowToObject(rawRow);
  const event = value(row, 'event');
  if (!allowedEvents.includes(event)) continue;

  const observedAtRaw = value(row, 'timestamp');
  const routeId = value(row, 'properties.route_id', 'route_id');
  const utmContent = value(row, 'properties.utm_content', 'utm_content');
  if (!observedAtRaw || !routeId || !utmContent) continue;

  const target = targetByKey.get(`${routeId}\u0000${utmContent}`);
  if (!target) continue;

  const observedAt = new Date(observedAtRaw).toISOString();
  const recordCore = {
    source: 'posthog',
    project_id: String(projectId),
    event,
    observed_at: observedAt,
    social_item_id: target.social_item_id,
    external_post_id: target.external_post_id,
    route_id: String(routeId),
    asset_id: value(row, 'properties.asset_id', 'asset_id') || null,
    utm_source: value(row, 'properties.utm_source', 'utm_source') || null,
    utm_medium: value(row, 'properties.utm_medium', 'utm_medium') || null,
    utm_campaign: value(row, 'properties.utm_campaign', 'utm_campaign') || null,
    utm_content: String(utmContent),
    destination_url: value(row, 'properties.destination_url', 'destination_url') || null
  };

  const evidenceKey = stableHash(JSON.stringify(recordCore));
  if (knownKeys.has(evidenceKey)) continue;

  knownKeys.add(evidenceKey);
  additions.push({
    ...recordCore,
    evidence_key: evidenceKey,
    evidence_ref: `posthog:project:${projectId}:event:${evidenceKey}`
  });
}

if (additions.length) {
  const currentText = fs.existsSync(evidencePath) ? fs.readFileSync(evidencePath, 'utf8').trimEnd() : '';
  const appended = additions.map((record) => JSON.stringify(record)).join('\n');
  fs.writeFileSync(evidencePath, `${currentText ? `${currentText}\n` : ''}${appended}\n`);
}

const finalRecords = [...existing, ...additions];
writeState(ledgerSummary(finalRecords, {
  status: 'CONNECTED',
  query_window_days: queryWindowDays
}));

console.log(JSON.stringify({
  status: 'CONNECTED',
  result_row_count: payload.results.length,
  imported_event_count: additions.length,
  evidence_record_count: finalRecords.filter((record) => record.source === 'posthog').length,
  attribution_target_count: uniqueTargetKeys.size
}, null, 2));
