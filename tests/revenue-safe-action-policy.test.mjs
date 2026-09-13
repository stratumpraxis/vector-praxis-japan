import test from "node:test";
import assert from "node:assert/strict";

import { planSafeRevenueAction } from "../scripts/revenue-safe-action-policy.mjs";

test("missing observations prohibit mutation", () => {
  const plan = planSafeRevenueAction({
    status: "OBSERVATION_INCOMPLETE",
    bottleneck: "diagnostic_choice_observation",
    missing_metric: "bottleneck_selections",
  });
  assert.equal(plan.mode, "observe");
  assert.equal(plan.mutation_allowed, false);
  assert.equal(plan.missing_metric, "bottleneck_selections");
});

test("entry friction permits only a reversible single-surface experiment", () => {
  const plan = planSafeRevenueAction({ status: "ENTRY_FRICTION", bottleneck: "entry" });
  assert.equal(plan.mode, "experiment");
  assert.equal(plan.mutation_allowed, true);
  assert.deepEqual(plan.allowed_scope, ["diagnostic_entry_copy", "diagnostic_entry_placement"]);
  assert.equal(plan.guardrails.max_active_bottlenecks, 1);
  assert.equal(plan.guardrails.requires_reversible_change, true);
});

test("offer friction never authorizes automatic price changes", () => {
  const plan = planSafeRevenueAction({ status: "OFFER_FRICTION", bottleneck: "paid_offer" });
  assert.equal(plan.selected_action, "TEST_OFFER_MESSAGE_OR_MATCH");
  assert.equal(plan.guardrails.auto_price_changes, false);
  assert.equal(plan.prohibited_actions.includes("AUTO_CHANGE_PRICE"), true);
});

test("checkout and payment gaps remain external-review only", () => {
  const checkout = planSafeRevenueAction({ status: "CHECKOUT_FRICTION", bottleneck: "external_checkout" });
  const payment = planSafeRevenueAction({ status: "PAYMENT_GAP", bottleneck: "payment" });
  assert.equal(checkout.mutation_allowed, false);
  assert.equal(payment.mutation_allowed, false);
  assert.equal(payment.guardrails.payment_evidence_must_be_verified, true);
});

test("healthy route amplifies existing assets instead of creating new products", () => {
  const plan = planSafeRevenueAction({ status: "HEALTHY", bottleneck: "none" });
  assert.equal(plan.mode, "amplify");
  assert.equal(plan.selected_action, "AMPLIFY_EXISTING_WINNING_ROUTE");
  assert.equal(plan.guardrails.auto_product_creation, false);
  assert.equal(plan.allowed_scope.includes("existing_asset_recirculation"), true);
});
