const DEFAULT_MAX_AGE_HOURS = 48;

export function evaluateRevenueEvidenceFreshness({
  observed_at,
  evaluated_at = new Date().toISOString(),
  max_age_hours = DEFAULT_MAX_AGE_HOURS,
} = {}) {
  const observed = Date.parse(observed_at ?? "");
  const evaluated = Date.parse(evaluated_at ?? "");

  if (!Number.isFinite(observed) || !Number.isFinite(evaluated)) {
    return {
      state: "UNKNOWN",
      actionable: false,
      age_hours: null,
      max_age_hours,
      reason: "Evidence timestamp is missing or invalid.",
    };
  }

  if (observed > evaluated) {
    return {
      state: "INVALID_FUTURE_TIMESTAMP",
      actionable: false,
      age_hours: null,
      max_age_hours,
      reason: "Evidence timestamp is later than the evaluation timestamp.",
    };
  }

  const ageHours = (evaluated - observed) / 3_600_000;
  const actionable = ageHours <= max_age_hours;

  return {
    state: actionable ? "FRESH" : "STALE",
    actionable,
    age_hours: Number(ageHours.toFixed(2)),
    max_age_hours,
    reason: actionable
      ? "Evidence is fresh enough for the current decision cycle."
      : "Evidence is too old for mutation or amplification; refresh measurements first.",
  };
}

export function gateRevenueActionByFreshness(action = {}, freshness = {}) {
  if (freshness.actionable === true) {
    return {
      ...action,
      freshness_gate: freshness,
    };
  }

  return {
    ...action,
    proposed_action_before_freshness_gate: action.selected_action ?? null,
    mode: "observe",
    selected_action: "REFRESH_REVENUE_EVIDENCE",
    auto_apply: false,
    mutation_allowed: false,
    allowed_scope: ["analytics_observation"],
    freshness_gate: freshness,
  };
}

export { DEFAULT_MAX_AGE_HOURS };
