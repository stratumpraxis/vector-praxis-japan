const DEFAULT_POLICY = Object.freeze({
  minimums: {
    owned_sessions: 20,
    diagnostic_entry_clicks: 10,
    diagnostic_sessions: 10,
    paid_recommendation_views: 10,
    checkout_reaches: 5,
  },
  thresholds: {
    entry_rate: 0.05,
    diagnostic_arrival_rate: 0.7,
    bottleneck_select_rate: 0.35,
    paid_cta_rate: 0.08,
    checkout_rate: 0.45,
    purchase_rate: 0.2,
  },
});

const safeDivide = (numerator, denominator) =>
  denominator > 0 ? numerator / denominator : null;

const clampCount = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
};

export function normalizeRevenueMetrics(input = {}) {
  const source = input.metrics ?? input;
  return {
    route_id: input.route_id ?? "vpj_owned_ai_agent_bottleneck_v2",
    window: input.window ?? "unspecified",
    metrics: {
      owned_sessions: clampCount(source.owned_sessions),
      diagnostic_entry_clicks: clampCount(source.diagnostic_entry_clicks),
      diagnostic_sessions: clampCount(source.diagnostic_sessions),
      bottleneck_selections: clampCount(source.bottleneck_selections),
      paid_recommendation_views: clampCount(source.paid_recommendation_views),
      paid_cta_clicks: clampCount(source.paid_cta_clicks),
      checkout_reaches: source.checkout_reaches == null ? null : clampCount(source.checkout_reaches),
      verified_human_purchases:
        source.verified_human_purchases == null ? null : clampCount(source.verified_human_purchases),
    },
  };
}

export function resolveRevenueBottleneck(input = {}, policy = DEFAULT_POLICY) {
  const normalized = normalizeRevenueMetrics(input);
  const m = normalized.metrics;
  const rates = {
    entry_rate: safeDivide(m.diagnostic_entry_clicks, m.owned_sessions),
    diagnostic_arrival_rate: safeDivide(m.diagnostic_sessions, m.diagnostic_entry_clicks),
    bottleneck_select_rate: safeDivide(m.bottleneck_selections, m.diagnostic_sessions),
    paid_cta_rate: safeDivide(m.paid_cta_clicks, m.paid_recommendation_views),
    checkout_rate:
      m.checkout_reaches == null ? null : safeDivide(m.checkout_reaches, m.paid_cta_clicks),
    purchase_rate:
      m.checkout_reaches == null || m.verified_human_purchases == null
        ? null
        : safeDivide(m.verified_human_purchases, m.checkout_reaches),
  };

  const result = (status, bottleneck, action, reason, confidence = "medium") => ({
    version: 1,
    route_id: normalized.route_id,
    window: normalized.window,
    status,
    bottleneck,
    action,
    reason,
    confidence,
    metrics: m,
    rates,
    evidence_rules: {
      checkout_is_optional_external_evidence: true,
      purchase_is_verified_external_evidence_only: true,
      paid_cta_click_is_not_checkout: true,
      paid_cta_click_is_not_purchase: true,
    },
  });

  if (m.owned_sessions === 0) {
    return result(
      "NO_TRAFFIC",
      "traffic",
      "ROUTE_MORE_OWNED_TRAFFIC",
      "Vector-owned sessions are zero; offer or checkout optimization would be premature.",
      "high",
    );
  }

  if (m.owned_sessions < policy.minimums.owned_sessions) {
    return result(
      "INSUFFICIENT_EVIDENCE",
      "sample",
      "COLLECT_MORE_EVIDENCE",
      `Need at least ${policy.minimums.owned_sessions} owned sessions before changing the entry surface.`,
      "low",
    );
  }

  if ((rates.entry_rate ?? 0) < policy.thresholds.entry_rate) {
    return result(
      "ENTRY_FRICTION",
      "entry",
      "ADJUST_ENTRY_COPY_OR_PLACEMENT",
      `Diagnostic entry rate is below ${(policy.thresholds.entry_rate * 100).toFixed(0)}%.`,
      "high",
    );
  }

  if (m.diagnostic_entry_clicks < policy.minimums.diagnostic_entry_clicks) {
    return result(
      "INSUFFICIENT_EVIDENCE",
      "entry_sample",
      "COLLECT_MORE_EVIDENCE",
      `Need at least ${policy.minimums.diagnostic_entry_clicks} diagnostic entry clicks before changing the diagnostic.`,
      "low",
    );
  }

  if ((rates.diagnostic_arrival_rate ?? 0) < policy.thresholds.diagnostic_arrival_rate) {
    return result(
      "DIAGNOSTIC_ARRIVAL_FRICTION",
      "diagnostic_arrival",
      "INSPECT_ROUTE_OR_LOAD_FRICTION",
      `Diagnostic arrival rate is below ${(policy.thresholds.diagnostic_arrival_rate * 100).toFixed(0)}%.`,
      "high",
    );
  }

  if (m.diagnostic_sessions < policy.minimums.diagnostic_sessions) {
    return result(
      "INSUFFICIENT_EVIDENCE",
      "diagnostic_sample",
      "COLLECT_MORE_EVIDENCE",
      `Need at least ${policy.minimums.diagnostic_sessions} diagnostic sessions before changing the first choice.`,
      "low",
    );
  }

  if ((rates.bottleneck_select_rate ?? 0) < policy.thresholds.bottleneck_select_rate) {
    return result(
      "DIAGNOSTIC_FRICTION",
      "diagnostic_choice",
      "SIMPLIFY_FIRST_DIAGNOSTIC_CHOICE",
      `Bottleneck selection rate is below ${(policy.thresholds.bottleneck_select_rate * 100).toFixed(0)}%.`,
      "high",
    );
  }

  if (m.paid_recommendation_views < policy.minimums.paid_recommendation_views) {
    return result(
      "INSUFFICIENT_EVIDENCE",
      "paid_offer_sample",
      "COLLECT_MORE_PAID_RECOMMENDATION_EVIDENCE",
      `Need at least ${policy.minimums.paid_recommendation_views} paid recommendation views before changing the offer.`,
      "low",
    );
  }

  if ((rates.paid_cta_rate ?? 0) < policy.thresholds.paid_cta_rate) {
    return result(
      "OFFER_FRICTION",
      "paid_offer",
      "ADJUST_OFFER_MESSAGE_OR_MATCH",
      `Paid CTA rate is below ${(policy.thresholds.paid_cta_rate * 100).toFixed(0)}%.`,
      "high",
    );
  }

  if (m.checkout_reaches == null) {
    return result(
      "ON_SITE_FUNNEL_HEALTHY_EXTERNAL_UNKNOWN",
      "external_checkout_unknown",
      "VERIFY_EXTERNAL_CHECKOUT_EVIDENCE",
      "On-site funnel cleared current thresholds, but checkout reach is not independently observed.",
      "medium",
    );
  }

  if (m.paid_cta_clicks > 0 && (rates.checkout_rate ?? 0) < policy.thresholds.checkout_rate) {
    return result(
      "CHECKOUT_FRICTION",
      "external_checkout",
      "INSPECT_EXTERNAL_CHECKOUT_ROUTE",
      `Observed checkout reach is below ${(policy.thresholds.checkout_rate * 100).toFixed(0)}% of paid CTA clicks.`,
      "high",
    );
  }

  if (m.checkout_reaches < policy.minimums.checkout_reaches) {
    return result(
      "INSUFFICIENT_EVIDENCE",
      "checkout_sample",
      "COLLECT_MORE_CHECKOUT_EVIDENCE",
      `Need at least ${policy.minimums.checkout_reaches} observed checkout reaches before judging purchase conversion.`,
      "low",
    );
  }

  if (m.verified_human_purchases == null) {
    return result(
      "CHECKOUT_HEALTHY_PAYMENT_UNKNOWN",
      "payment_evidence_unknown",
      "VERIFY_HUMAN_PAYMENT_EVIDENCE",
      "Checkout evidence exists, but no independently verified human purchase count was supplied.",
      "medium",
    );
  }

  if ((rates.purchase_rate ?? 0) < policy.thresholds.purchase_rate) {
    return result(
      "PAYMENT_GAP",
      "payment",
      "INSPECT_PRICE_TRUST_OR_CHECKOUT_FRICTION",
      `Verified human purchase rate is below ${(policy.thresholds.purchase_rate * 100).toFixed(0)}% of observed checkout reaches.`,
      "high",
    );
  }

  return result(
    "HEALTHY",
    "none",
    "AMPLIFY_WINNING_ROUTE",
    "Observed funnel stages meet current policy thresholds with verified human purchase evidence.",
    "high",
  );
}

async function runCli() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    console.error("Provide funnel metrics as JSON on stdin.");
    process.exitCode = 64;
    return;
  }
  const input = JSON.parse(raw);
  process.stdout.write(`${JSON.stringify(resolveRevenueBottleneck(input), null, 2)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { DEFAULT_POLICY };
