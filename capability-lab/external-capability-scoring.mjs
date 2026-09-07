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

export const POLLING_MODES = new Set([
  'WEBHOOK', 'EVENT_TRIGGER', 'RSS_FEED', 'CONDITIONAL_SCHEDULE', 'LOW_FREQUENCY_POLLING',
  'HIGH_FREQUENCY_POLLING', 'ON_DEMAND', 'NONE'
]);

export const RISK_LEVELS = new Set(['LOW', 'MEDIUM', 'HIGH']);

export function isUsableCapability(capability) {
  if (['VERIFIED', 'ON_DEMAND', 'ACTIVE'].includes(capability?.state)) return true;
  if (capability?.state === 'PAUSED' && capability?.last_verified_at) return true;
  return false;
}

function validateRiskObject(capability, errors) {
  const required = [
    'free_tier_change', 'api_shutdown', 'terms_change', 'vendor_lock_in',
    'authentication', 'rate_limit', 'schema_change'
  ];
  if (!capability?.dependency_risks || typeof capability.dependency_risks !== 'object') {
    errors.push('missing:dependency_risks');
    return;
  }
  for (const key of required) {
    if (!RISK_LEVELS.has(capability.dependency_risks[key])) errors.push(`invalid:risk:${key}`);
  }
}

export function scoreCapability(capability) {
  const errors = [];

  if (!capability?.id) errors.push('missing:id');
  if (!LIFECYCLE_STATES.has(capability?.state)) errors.push('invalid:state');
  if (!OVERLAP_STATES.has(capability?.overlap)) errors.push('invalid:overlap');
  if (!POLLING_MODES.has(capability?.polling_mode)) errors.push('invalid:polling_mode');
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

  if (!Number.isInteger(capability?.expected_revenue_utility) || capability.expected_revenue_utility < 0 || capability.expected_revenue_utility > 10) {
    errors.push('invalid:expected_revenue_utility');
  }
  if (!Number.isInteger(capability?.maintenance_burden) || capability.maintenance_burden < 0 || capability.maintenance_burden > 10) {
    errors.push('invalid:maintenance_burden');
  }
  if (!Number.isInteger(capability?.revenue_evidence_score) || capability.revenue_evidence_score < 0 || capability.revenue_evidence_score > 100) {
    errors.push('invalid:revenue_evidence_score');
  }

  validateRiskObject(capability, errors);

  if (['CONNECTED', 'VERIFIED', 'ON_DEMAND', 'ACTIVE', 'PAUSED'].includes(capability?.state)) {
    if (!Array.isArray(capability?.evidence) || capability.evidence.length === 0) {
      errors.push('connected_or_higher_requires_evidence');
    }
  }
  if (['VERIFIED', 'ON_DEMAND', 'ACTIVE'].includes(capability?.state) && !capability?.last_verified_at) {
    errors.push('verified_or_higher_requires:last_verified_at');
  }
  if (capability?.state === 'PAUSED' && capability?.counts_as_usable && !capability?.last_verified_at) {
    errors.push('paused_usable_requires:last_verified_at');
  }

  if (capability?.polling_mode === 'HIGH_FREQUENCY_POLLING' && capability?.signal_change_speed !== 'FAST') {
    errors.push('high_frequency_polling_requires_fast_signal');
  }

  const evidenceLevel = {
    AVAILABLE: 0,
    CONNECTED: 1,
    VERIFIED: 2,
    ON_DEMAND: 3,
    ACTIVE: 4,
    PAUSED: capability?.last_verified_at ? 2 : 0,
    RETIRED: 0
  }[capability?.state] ?? 0;

  const utility = capability?.expected_revenue_utility ?? 0;
  const burden = capability?.maintenance_burden ?? 10;
  const budgetPass = utility > burden;
  const actionRiskHigh = capability?.classes?.includes('MOUTH_HANDS') && capability?.scores?.safety_policy < 8;

  let recommendation = 'WATCH';
  if (errors.length) recommendation = 'INVALID';
  else if (capability.state === 'RETIRED') recommendation = 'RETIRED';
  else if (capability.overlap === 'FULL_DUPLICATE') recommendation = 'KILL_OR_IGNORE';
  else if (!budgetPass && capability.state === 'AVAILABLE') recommendation = 'AVAILABLE_HOLD';
  else if (actionRiskHigh) recommendation = 'SAFETY_HOLD';
  else if (total >= 85 && capability.scores.safety_policy >= 8 && capability.scores.market_synergy >= 8) recommendation = 'PRIORITY_VERIFY';
  else if (total >= 75) recommendation = 'VERIFY';
  else if (total < 60) recommendation = 'KILL_OR_IGNORE';

  return {
    id: capability?.id,
    capability_score: total,
    revenue_evidence_score: capability?.revenue_evidence_score ?? 0,
    usable: isUsableCapability(capability),
    evidence_level: evidenceLevel,
    budget_pass: budgetPass,
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

  const usable_count = results.filter((result) => result.usable).length;
  const candidate_count = results.filter((result) => !result.usable && result.recommendation !== 'RETIRED').length;

  return {
    status: errors.length ? 'FAIL' : 'PASS',
    errors,
    usable_count,
    candidate_count,
    results
  };
}

export function shouldStopExploration(context) {
  const reasons = [];
  if (context?.route_has_required_capabilities) reasons.push('ROUTE_CAPABILITIES_READY');
  if (context?.top_route_externally_executable) reasons.push('TOP_ROUTE_EXECUTABLE');
  if (context?.waiting_human_signal) reasons.push('WAITING_HUMAN_SIGNAL');
  if (context?.checkout_or_contract_reached) reasons.push('CHECKOUT_OR_CONTRACT_REACHED');
  if ((context?.same_class_meaningful_capabilities ?? 0) >= 2) reasons.push('SAME_CLASS_CAP_REACHED');
  if (context?.revenue_distance_delta_for_new_capability === 0) reasons.push('NO_REVENUE_DISTANCE_GAIN');
  if ((context?.expected_revenue_utility ?? 0) <= (context?.maintenance_burden ?? 0)) reasons.push('MAINTENANCE_EXCEEDS_UTILITY');
  if (context?.winner_route_active) reasons.push('AMPLIFY_WINNER');
  return { stop: reasons.length > 0, reasons };
}
