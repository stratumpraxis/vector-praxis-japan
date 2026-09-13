const BASE_GUARDRAILS = Object.freeze({
  max_active_bottlenecks: 1,
  requires_reversible_change: true,
  requires_before_snapshot: true,
  requires_after_snapshot: true,
  auto_price_changes: false,
  auto_external_checkout_mutations: false,
  auto_product_creation: false,
  payment_evidence_must_be_verified: true,
  vector_scope_only: true,
});

const POLICY = Object.freeze({
  OBSERVATION_INCOMPLETE: {
    mode: "observe",
    auto_apply: false,
    mutation_allowed: false,
    selected_action: "COLLECT_MISSING_METRIC",
    allowed_scope: ["analytics_observation"],
  },
  NO_TRAFFIC: {
    mode: "route",
    auto_apply: false,
    mutation_allowed: false,
    selected_action: "ROUTE_EXISTING_OWNED_TRAFFIC",
    allowed_scope: ["owned_distribution"],
  },
  INSUFFICIENT_EVIDENCE: {
    mode: "observe",
    auto_apply: false,
    mutation_allowed: false,
    selected_action: "COLLECT_MORE_EVIDENCE",
    allowed_scope: ["analytics_observation"],
  },
  ENTRY_FRICTION: {
    mode: "experiment",
    auto_apply: false,
    mutation_allowed: true,
    selected_action: "TEST_ENTRY_COPY_OR_PLACEMENT",
    allowed_scope: ["diagnostic_entry_copy", "diagnostic_entry_placement"],
  },
  DIAGNOSTIC_ARRIVAL_FRICTION: {
    mode: "inspect",
    auto_apply: false,
    mutation_allowed: false,
    selected_action: "VERIFY_ROUTE_AND_LOAD_HEALTH",
    allowed_scope: ["route_health", "page_load_health"],
  },
  DIAGNOSTIC_FRICTION: {
    mode: "experiment",
    auto_apply: false,
    mutation_allowed: true,
    selected_action: "TEST_DIAGNOSTIC_FIRST_CHOICE",
    allowed_scope: ["diagnostic_choice_copy", "diagnostic_choice_order"],
  },
  OFFER_FRICTION: {
    mode: "experiment",
    auto_apply: false,
    mutation_allowed: true,
    selected_action: "TEST_OFFER_MESSAGE_OR_MATCH",
    allowed_scope: ["offer_message", "offer_match"],
  },
  ON_SITE_FUNNEL_HEALTHY_EXTERNAL_UNKNOWN: {
    mode: "observe",
    auto_apply: false,
    mutation_allowed: false,
    selected_action: "VERIFY_EXTERNAL_CHECKOUT_EVIDENCE",
    allowed_scope: ["external_checkout_observation"],
  },
  CHECKOUT_FRICTION: {
    mode: "inspect",
    auto_apply: false,
    mutation_allowed: false,
    selected_action: "INSPECT_EXTERNAL_CHECKOUT_ROUTE",
    allowed_scope: ["external_checkout_observation"],
  },
  CHECKOUT_HEALTHY_PAYMENT_UNKNOWN: {
    mode: "observe",
    auto_apply: false,
    mutation_allowed: false,
    selected_action: "VERIFY_HUMAN_PAYMENT_EVIDENCE",
    allowed_scope: ["payment_evidence"],
  },
  PAYMENT_GAP: {
    mode: "recommend",
    auto_apply: false,
    mutation_allowed: false,
    selected_action: "REVIEW_PRICE_TRUST_AND_CHECKOUT",
    allowed_scope: ["price_review", "trust_review", "checkout_review"],
  },
  HEALTHY: {
    mode: "amplify",
    auto_apply: false,
    mutation_allowed: false,
    selected_action: "AMPLIFY_EXISTING_WINNING_ROUTE",
    allowed_scope: ["owned_distribution", "existing_asset_recirculation"],
  },
});

export function planSafeRevenueAction(resolution = {}) {
  const status = resolution.status ?? "OBSERVATION_INCOMPLETE";
  const selected = POLICY[status] ?? POLICY.OBSERVATION_INCOMPLETE;

  return {
    version: 1,
    resolution_status: status,
    bottleneck: resolution.bottleneck ?? "unknown",
    missing_metric: resolution.missing_metric ?? null,
    mode: selected.mode,
    selected_action: selected.selected_action,
    auto_apply: selected.auto_apply,
    mutation_allowed: selected.mutation_allowed,
    allowed_scope: [...selected.allowed_scope],
    guardrails: { ...BASE_GUARDRAILS },
    prohibited_actions: [
      "CHANGE_MULTIPLE_BOTTLENECKS_AT_ONCE",
      "INFER_CHECKOUT_FROM_CTA_CLICK",
      "INFER_PAYMENT_FROM_CHECKOUT",
      "AUTO_CHANGE_PRICE",
      "AUTO_MUTATE_EXTERNAL_CHECKOUT",
      "CREATE_NEW_PRODUCT_WHEN_EXISTING_ASSET_ROUTE_CAN_BE_TESTED",
      "MIX_NON_VECTOR_BRAND_ASSETS",
    ],
  };
}

export { BASE_GUARDRAILS, POLICY };
