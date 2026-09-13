import test from "node:test";
import assert from "node:assert/strict";

import { buildRevenuePulseSnapshot } from "../scripts/revenue-pulse-snapshot.mjs";

test("snapshot distinguishes observed zero from unobserved null", async () => {
  const snapshot = await buildRevenuePulseSnapshot({
    observed_at: "2026-09-13T13:30:00Z",
    evaluated_at: "2026-09-13T14:00:00Z",
    window: "24h",
    metrics: {
      owned_sessions: 25,
      diagnostic_entry_clicks: 0,
    },
  });

  assert.equal(snapshot.metrics.diagnostic_entry_clicks.value, 0);
  assert.equal(snapshot.metrics.diagnostic_entry_clicks.observation_state, "observed");
  assert.equal(snapshot.metrics.diagnostic_sessions.value, null);
  assert.equal(snapshot.metrics.diagnostic_sessions.observation_state, "unobserved");
});

test("snapshot remains hard-scoped to Vector and preserves evidence provenance", async () => {
  const snapshot = await buildRevenuePulseSnapshot({ metrics: { owned_sessions: 1 } });

  assert.equal(snapshot.analytics_scope, "vector_praxis_japan");
  assert.equal(snapshot.route_id, "vpj_owned_ai_agent_bottleneck_v2");
  assert.equal(snapshot.metrics.owned_sessions.source, "posthog");
  assert.equal(snapshot.metrics.checkout_reaches.source, "external_checkout_evidence");
  assert.equal(snapshot.metrics.verified_human_purchases.source, "external_payment_evidence");
});

test("snapshot feeds unknown evidence to resolver and safe policy without mutating", async () => {
  const snapshot = await buildRevenuePulseSnapshot({
    metrics: {
      owned_sessions: 100,
      diagnostic_entry_clicks: 20,
      diagnostic_sessions: 18,
    },
  });

  assert.equal(snapshot.resolution.status, "OBSERVATION_INCOMPLETE");
  assert.equal(snapshot.resolution.missing_metric, "bottleneck_selections");
  assert.equal(snapshot.resolution.metrics.bottleneck_selections, null);
  assert.equal(snapshot.safe_action.mode, "observe");
  assert.equal(snapshot.safe_action.mutation_allowed, false);
  assert.equal(snapshot.safe_action.selected_action, "COLLECT_MISSING_METRIC");
});

test("snapshot can carry verified external payment evidence without inferring it", async () => {
  const snapshot = await buildRevenuePulseSnapshot({
    metrics: {
      owned_sessions: 100,
      diagnostic_entry_clicks: 20,
      diagnostic_sessions: 18,
      bottleneck_selections: 12,
      paid_recommendation_views: 20,
      paid_cta_clicks: 10,
      checkout_reaches: 6,
      verified_human_purchases: 2
    },
  });

  assert.equal(snapshot.metrics.checkout_reaches.observation_state, "observed");
  assert.equal(snapshot.metrics.verified_human_purchases.observation_state, "observed");
  assert.equal(snapshot.resolution.status, "HEALTHY");
  assert.equal(snapshot.safe_action.mode, "amplify");
  assert.equal(snapshot.safe_action.selected_action, "AMPLIFY_EXISTING_WINNING_ROUTE");
  assert.equal(snapshot.safe_action.guardrails.auto_product_creation, false);
});

test("stale healthy evidence is downgraded to an evidence refresh ticket", async () => {
  const snapshot = await buildRevenuePulseSnapshot({
    observed_at: "2026-09-10T10:00:00Z",
    evaluated_at: "2026-09-13T20:00:00Z",
    metrics: {
      owned_sessions: 100,
      diagnostic_entry_clicks: 20,
      diagnostic_sessions: 18,
      bottleneck_selections: 12,
      paid_recommendation_views: 20,
      paid_cta_clicks: 10,
      checkout_reaches: 6,
      verified_human_purchases: 2
    },
  });

  assert.equal(snapshot.resolution.status, "HEALTHY");
  assert.equal(snapshot.freshness.state, "STALE");
  assert.equal(snapshot.safe_action.mode, "observe");
  assert.equal(snapshot.safe_action.selected_action, "REFRESH_REVENUE_EVIDENCE");
  assert.equal(snapshot.safe_action.mutation_allowed, false);
  assert.equal(snapshot.action_ticket.state, "EVIDENCE_REQUIRED");
  assert.equal(snapshot.action_ticket.target_metric, "evidence_freshness");
});
