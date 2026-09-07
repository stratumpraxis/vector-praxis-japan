export const SCORE_FIELDS = [
  'external_reach',
  'signal_quality',
  'revenue_distance',
  'automation',
  'owner_burden',
  'free_sustainability',
  'safety_policy',
  'reliability',
  'return_path',
  'market_synergy'
];

export const LIFECYCLE_STATES = new Set([
  'AVAILABLE', 'CONNECTED', 'VERIFIED', 'ON_DEMAND', 'ACTIVE', 'PAUSED', 'RETIRED'
]);

export const CAPABILITY_CLASSES = new Set([
  'EYES', 'EARS', 'BRAIN_INPUT', 'MOUTH_HANDS', 'NERVES', 'WALLET'
]);

export const OVERLAP_STATES = new Set([
  'NEW_SENSOR', 'COMPLEMENT', 'IMPORTANT_FALLBACK', 'PARTIAL_OVERLAP', 'FULL_DUPLICATE'
]);

export function scoreCapability(capability) {
  const errors = [];

  if (!capability?.id) errors.push('missing:id');
  if (!LIFECYCLE_STATES.has(capability?.state)) errors.push('invalid:state');
  if (!OVERLAP_STATES.has(capability?.overlap)) errors.push('invalid:overlap');
  if (!Array.isArray(capability?.classes) || capability.classes.length === 0) {
    errors.push('missing:classes');
  } else {
    for (const value of capability.classes) {
      if (!CAPABILITY_CLASSES.has(value)) errors.push(`invalid:class:${value}`);
    }
  }

  let total = 0;
  for (const field of SCORE_FIELDS) {
    const value = capability?.scores?.[field];
    if (!Number.isInteger(value) || value < 0 || value > 10) {
      errors.push(`invalid:score:${field}`);
    } else {
      total += value;
    }
  }

  if (['CONNECTED', 'VERIFIED', 'ON_DEMAND', 'ACTIVE'].includes(capability?.state)) {
    if (!Array.isArray(capability?.evidence) || capability.evidence.length === 0) {
      errors.push('connected_or_higher_requires_evidence');
    }
  }

  const evidenceLevel = {
    AVAILABLE: 0,
    CONNECTED: 1,
    VERIFIED: 2,
    ON_DEMAND: 3,
    ACTIVE: 4,
    PAUSED: 2,
    RETIRED: 0
  }[capability?.state] ?? 0;

  let recommendation = 'WATCH';
  if (errors.length) recommendation = 'INVALID';
  else if (capability.state === 'RETIRED') recommendation = 'RETIRED';
  else if (capability.overlap === 'FULL_DUPLICATE') recommendation = 'KILL_OR_IGNORE';
  else if (total >= 85 && capability.scores.safety_policy >= 8 && capability.scores.market_synergy >= 8) recommendation = 'PRIORITY_VERIFY';
  else if (total >= 75) recommendation = 'VERIFY';
  else if (total < 60) recommendation = 'KILL_OR_IGNORE';

  return {
    id: capability?.id,
    score: total,
    evidence_level: evidenceLevel,
    recommendation,
    errors
  };
}

export function validateRegistry(registry) {
  const ids = new Set();
  const results = [];
  const errors = [];

  for (const capability of registry?.capabilities ?? []) {
    if (ids.has(capability.id)) errors.push(`duplicate:id:${capability.id}`);
    ids.add(capability.id);
    const result = scoreCapability(capability);
    results.push(result);
    errors.push(...result.errors.map((error) => `${capability.id}:${error}`));
  }

  return { status: errors.length ? 'FAIL' : 'PASS', errors, results };
}
