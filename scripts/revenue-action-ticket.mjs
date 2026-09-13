import { createHash } from "node:crypto";

const TARGET_METRIC_BY_STATUS = Object.freeze({
  OBSERVATION_INCOMPLETE: "missing_metric_observed",
  NO_TRAFFIC: "owned_sessions",
  INSUFFICIENT_EVIDENCE: "sample_size",
  ENTRY_FRICTION: "entry_rate",
  DIAGNOSTIC_ARRIVAL_FRICTION: "diagnostic_arrival_rate",
  DIAGNOSTIC_FRICTION: "bottleneck_select_rate",
  OFFER_FRICTION: "paid_cta_rate",
  ON_SITE_FUNNEL_HEALTHY_EXTERNAL_UNKNOWN: "checkout_reaches",
  CHECKOUT_FRICTION: "checkout_rate",
  CHECKOUT_HEALTHY_PAYMENT_UNKNOWN: "verified_human_purchases",
  PAYMENT_GAP: "purchase_rate",
  HEALTHY: "verified_human_purchases",
});

const ticketState = (safeAction) => {
  if (safeAction.mode === "experiment" && safeAction.mutation_allowed) return "PROPOSED_EXPERIMENT";
  if (safeAction.mode === "amplify") return "PROPOSED_AMPLIFICATION";
  if (safeAction.mode === "route") return "PROPOSED_ROUTING";
  if (safeAction.mode === "inspect") return "INSPECTION_REQUIRED";
  if (safeAction.mode === "recommend") return "REVIEW_REQUIRED";
  return "EVIDENCE_REQUIRED";
};

export function buildRevenueActionTicket(snapshot = {}) {
  if (!snapshot.resolution || !snapshot.safe_action) {
    throw new Error("Revenue snapshot must include resolution and safe_action.");
  }

  const resolution = snapshot.resolution;
  const safeAction = snapshot.safe_action;
  const fingerprint = [
    snapshot.observed_at ?? "unknown",
    snapshot.route_id ?? resolution.route_id ?? "unknown",
    resolution.status ?? "unknown",
    safeAction.selected_action ?? "unknown",
  ].join("|");
  const id = `vector-revenue-${createHash("sha256").update(fingerprint).digest("hex").slice(0, 12)}`;
  const refreshRequired = safeAction.selected_action === "REFRESH_REVENUE_EVIDENCE";

  return {
    version: 2,
    id,
    created_from_observed_at: snapshot.observed_at ?? null,
    window: snapshot.window ?? resolution.window ?? "unspecified",
    analytics_scope: snapshot.analytics_scope ?? "vector_praxis_japan",
    route_id: snapshot.route_id ?? resolution.route_id ?? "vpj_owned_ai_agent_bottleneck_v2",
    state: ticketState(safeAction),
    bottleneck: resolution.bottleneck,
    resolution_status: resolution.status,
    action: safeAction.selected_action,
    target_metric: refreshRequired
      ? "evidence_freshness"
      : TARGET_METRIC_BY_STATUS[resolution.status] ?? "unknown",
    allowed_scope: [...(safeAction.allowed_scope ?? [])],
    mutation_allowed: safeAction.mutation_allowed === true,
    auto_apply: false,
    one_change_only: true,
    before_snapshot_required: true,
    after_snapshot_required: true,
    rollback_required_for_mutation: safeAction.mutation_allowed === true,
    guardrails: { ...(safeAction.guardrails ?? {}) },
    evidence: {
      missing_metric: resolution.missing_metric ?? null,
      freshness: safeAction.freshness_gate ?? snapshot.freshness ?? null,
      metrics: resolution.metrics ?? {},
      rates: resolution.rates ?? {},
    },
    completion_rule: refreshRequired
      ? "Refresh the revenue evidence before any mutation, routing expansion, or amplification decision."
      : safeAction.mode === "experiment"
        ? "Collect a comparable after-snapshot before accepting the change as an improvement."
        : "Complete only the selected evidence, routing, inspection, review, or amplification task; do not expand scope.",
  };
}

export { TARGET_METRIC_BY_STATUS };
