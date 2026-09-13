import test from "node:test";
import assert from "node:assert/strict";

import { buildRevenueActionTicket } from "../scripts/revenue-action-ticket.mjs";

const snapshot = (status, safeAction, extras = {}) => ({
  observed_at: "2026-09-13T13:40:00Z",
  window: "24h",
  analytics_scope: "vector_praxis_japan",
  route_id: "vpj_owned_ai_agent_bottleneck_v2",
  resolution: {
    status,
    bottleneck: extras.bottleneck ?? "entry",
    missing_metric: extras.missing_metric ?? null,
    metrics: extras.metrics ?? {},
    rates: extras.rates ?? {},
  },
  safe_action: safeAction,
});

test("experiment ticket stays one-change and reversible", () => {
  const ticket = buildRevenueActionTicket(
    snapshot("ENTRY_FRICTION", {
      mode: "experiment",
      selected_action: "TEST_ENTRY_COPY_OR_PLACEMENT",
      mutation_allowed: true,
      allowed_scope: ["diagnostic_entry_copy", "diagnostic_entry_placement"],
      guardrails: { max_active_bottlenecks: 1 },
    }),
  );
  assert.equal(ticket.state, "PROPOSED_EXPERIMENT");
  assert.equal(ticket.target_metric, "entry_rate");
  assert.equal(ticket.one_change_only, true);
  assert.equal(ticket.rollback_required_for_mutation, true);
  assert.equal(ticket.auto_apply, false);
});

test("evidence gap creates evidence ticket without mutation", () => {
  const ticket = buildRevenueActionTicket(
    snapshot(
      "OBSERVATION_INCOMPLETE",
      {
        mode: "observe",
        selected_action: "COLLECT_MISSING_METRIC",
        mutation_allowed: false,
        allowed_scope: ["analytics_observation"],
        guardrails: {},
      },
      { missing_metric: "bottleneck_selections" },
    ),
  );
  assert.equal(ticket.state, "EVIDENCE_REQUIRED");
  assert.equal(ticket.target_metric, "missing_metric_observed");
  assert.equal(ticket.evidence.missing_metric, "bottleneck_selections");
  assert.equal(ticket.mutation_allowed, false);
});

test("healthy route produces amplification ticket without product creation authority", () => {
  const ticket = buildRevenueActionTicket(
    snapshot("HEALTHY", {
      mode: "amplify",
      selected_action: "AMPLIFY_EXISTING_WINNING_ROUTE",
      mutation_allowed: false,
      allowed_scope: ["owned_distribution", "existing_asset_recirculation"],
      guardrails: { auto_product_creation: false },
    }),
  );
  assert.equal(ticket.state, "PROPOSED_AMPLIFICATION");
  assert.equal(ticket.target_metric, "verified_human_purchases");
  assert.equal(ticket.guardrails.auto_product_creation, false);
});

test("ticket id is deterministic for the same evidence snapshot", () => {
  const input = snapshot("NO_TRAFFIC", {
    mode: "route",
    selected_action: "ROUTE_EXISTING_OWNED_TRAFFIC",
    mutation_allowed: false,
    allowed_scope: ["owned_distribution"],
    guardrails: {},
  });
  assert.equal(buildRevenueActionTicket(input).id, buildRevenueActionTicket(input).id);
});
