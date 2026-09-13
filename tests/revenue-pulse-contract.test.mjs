import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const contract = JSON.parse(
  await readFile(new URL("../capability-lab/vector-revenue-pulse-contract.json", import.meta.url), "utf8"),
);

test("revenue pulse is hard-scoped to Vector inside shared analytics", () => {
  assert.equal(contract.scope.property, "analytics_scope");
  assert.equal(contract.scope.value, "vector_praxis_japan");
  assert.equal(contract.evidence_rules.shared_posthog_requires_vector_scope_filter, true);
  for (const metric of Object.values(contract.metrics)) {
    if (metric.source === "posthog") {
      assert.equal(metric.filters.analytics_scope, "vector_praxis_japan");
    }
  }
});

test("diagnostic entry and session metrics use the owned Vector route", () => {
  assert.equal(contract.diagnostic_path, "/ai-agent-bottleneck");
  assert.equal(contract.metrics.diagnostic_entry_clicks.event, "priority_entry_click");
  assert.equal(contract.metrics.diagnostic_entry_clicks.filters.destination_path, "/ai-agent-bottleneck");
  assert.equal(contract.metrics.diagnostic_sessions.event, "funnel_view");
  assert.equal(contract.metrics.diagnostic_sessions.filters.path, "/ai-agent-bottleneck");
  assert.equal(contract.metrics.paid_cta_clicks.filters.route_id, "vpj_owned_ai_agent_bottleneck_v2");
});

test("unobserved analytics stages stay unknown instead of becoming zero", () => {
  assert.equal(
    contract.metrics.bottleneck_selections.observation,
    "unobserved_until_event_appears_in_schema",
  );
  assert.equal(
    contract.metrics.paid_recommendation_views.observation,
    "unobserved_until_event_appears_in_schema",
  );
  assert.equal(contract.evidence_rules.missing_or_unobserved_is_not_zero, true);
});

test("onsite intent evidence cannot masquerade as checkout or payment", () => {
  assert.equal(contract.metrics.checkout_reaches.source, "external_checkout_evidence");
  assert.equal(contract.metrics.verified_human_purchases.source, "external_payment_evidence");
  assert.equal(contract.evidence_rules.paid_cta_click_is_not_checkout, true);
  assert.equal(contract.evidence_rules.checkout_is_not_purchase, true);
  assert.equal(contract.evidence_rules.purchase_requires_verified_human_payment_evidence, true);
});
