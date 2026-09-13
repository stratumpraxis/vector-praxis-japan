import test from "node:test";
import assert from "node:assert/strict";

import {
  evaluateRevenueEvidenceFreshness,
  gateRevenueActionByFreshness,
} from "../scripts/revenue-evidence-freshness.mjs";

test("fresh evidence remains actionable", () => {
  const freshness = evaluateRevenueEvidenceFreshness({
    observed_at: "2026-09-13T10:00:00Z",
    evaluated_at: "2026-09-13T20:00:00Z",
  });
  assert.equal(freshness.state, "FRESH");
  assert.equal(freshness.actionable, true);
  assert.equal(freshness.age_hours, 10);
});

test("stale evidence blocks experiment and requests refresh", () => {
  const freshness = evaluateRevenueEvidenceFreshness({
    observed_at: "2026-09-10T10:00:00Z",
    evaluated_at: "2026-09-13T20:00:00Z",
  });
  const gated = gateRevenueActionByFreshness(
    {
      mode: "experiment",
      selected_action: "TEST_ENTRY_COPY_OR_PLACEMENT",
      mutation_allowed: true,
      allowed_scope: ["diagnostic_entry_copy"],
    },
    freshness,
  );
  assert.equal(freshness.state, "STALE");
  assert.equal(gated.selected_action, "REFRESH_REVENUE_EVIDENCE");
  assert.equal(gated.mutation_allowed, false);
  assert.equal(gated.proposed_action_before_freshness_gate, "TEST_ENTRY_COPY_OR_PLACEMENT");
});

test("invalid or future timestamps are never actionable", () => {
  const missing = evaluateRevenueEvidenceFreshness({});
  const future = evaluateRevenueEvidenceFreshness({
    observed_at: "2026-09-14T00:00:00Z",
    evaluated_at: "2026-09-13T20:00:00Z",
  });
  assert.equal(missing.actionable, false);
  assert.equal(future.state, "INVALID_FUTURE_TIMESTAMP");
  assert.equal(future.actionable, false);
});
