import test from "node:test";
import assert from "node:assert/strict";

import { resolveRevenueBottleneck } from "../scripts/revenue-auto-resolver.mjs";

const base = {
  route_id: "vpj_owned_ai_agent_bottleneck_v2",
  window: "24h",
  metrics: {
    owned_sessions: 100,
    diagnostic_entry_clicks: 20,
    diagnostic_sessions: 18,
    bottleneck_selections: 12,
    paid_recommendation_views: 10,
    paid_cta_clicks: 2,
  },
};

test("zero traffic routes to distribution instead of offer changes", () => {
  const result = resolveRevenueBottleneck({ metrics: { owned_sessions: 0 } });
  assert.equal(result.status, "NO_TRAFFIC");
  assert.equal(result.action, "ROUTE_MORE_OWNED_TRAFFIC");
});

test("small samples do not trigger premature UI changes", () => {
  const result = resolveRevenueBottleneck({ metrics: { owned_sessions: 12, diagnostic_entry_clicks: 1 } });
  assert.equal(result.status, "INSUFFICIENT_EVIDENCE");
  assert.equal(result.action, "COLLECT_MORE_EVIDENCE");
});

test("weak entry rate resolves to entry copy or placement", () => {
  const result = resolveRevenueBottleneck({
    metrics: { owned_sessions: 100, diagnostic_entry_clicks: 2 },
  });
  assert.equal(result.status, "ENTRY_FRICTION");
  assert.equal(result.bottleneck, "entry");
});

test("weak diagnostic selection resolves to first-choice simplification", () => {
  const result = resolveRevenueBottleneck({
    metrics: {
      owned_sessions: 100,
      diagnostic_entry_clicks: 20,
      diagnostic_sessions: 18,
      bottleneck_selections: 3,
    },
  });
  assert.equal(result.status, "DIAGNOSTIC_FRICTION");
  assert.equal(result.action, "SIMPLIFY_FIRST_DIAGNOSTIC_CHOICE");
});

test("weak paid CTA rate resolves to offer match", () => {
  const result = resolveRevenueBottleneck({
    metrics: {
      owned_sessions: 100,
      diagnostic_entry_clicks: 20,
      diagnostic_sessions: 18,
      bottleneck_selections: 12,
      paid_recommendation_views: 20,
      paid_cta_clicks: 1,
    },
  });
  assert.equal(result.status, "OFFER_FRICTION");
  assert.equal(result.action, "ADJUST_OFFER_MESSAGE_OR_MATCH");
});

test("paid CTA click is never inferred as checkout or purchase", () => {
  const result = resolveRevenueBottleneck(base);
  assert.equal(result.status, "ON_SITE_FUNNEL_HEALTHY_EXTERNAL_UNKNOWN");
  assert.equal(result.metrics.checkout_reaches, null);
  assert.equal(result.metrics.verified_human_purchases, null);
  assert.equal(result.evidence_rules.paid_cta_click_is_not_checkout, true);
  assert.equal(result.evidence_rules.paid_cta_click_is_not_purchase, true);
});

test("healthy requires observed checkout and verified human purchase evidence", () => {
  const result = resolveRevenueBottleneck({
    ...base,
    metrics: {
      ...base.metrics,
      paid_recommendation_views: 10,
      paid_cta_clicks: 4,
      checkout_reaches: 3,
      verified_human_purchases: 1,
    },
  });
  assert.equal(result.status, "INSUFFICIENT_EVIDENCE");

  const proven = resolveRevenueBottleneck({
    ...base,
    metrics: {
      ...base.metrics,
      paid_recommendation_views: 20,
      paid_cta_clicks: 10,
      checkout_reaches: 6,
      verified_human_purchases: 2,
    },
  });
  assert.equal(proven.status, "HEALTHY");
  assert.equal(proven.action, "AMPLIFY_WINNING_ROUTE");
});
