import { readFile } from "node:fs/promises";
import { resolveRevenueBottleneck } from "./revenue-auto-resolver.mjs";
import { planSafeRevenueAction } from "./revenue-safe-action-policy.mjs";
import { buildRevenueActionTicket } from "./revenue-action-ticket.mjs";
import {
  evaluateRevenueEvidenceFreshness,
  gateRevenueActionByFreshness,
} from "./revenue-evidence-freshness.mjs";

const contractUrl = new URL("../capability-lab/vector-revenue-pulse-contract.json", import.meta.url);

const toObservedValue = (value) => {
  if (value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return number > 0 ? Math.floor(number) : 0;
};

export async function loadRevenuePulseContract() {
  return JSON.parse(await readFile(contractUrl, "utf8"));
}

export async function buildRevenuePulseSnapshot(input = {}) {
  const contract = await loadRevenuePulseContract();
  const supplied = input.metrics ?? {};
  const evaluatedAt = input.evaluated_at ?? new Date().toISOString();
  const observedAt = input.observed_at ?? evaluatedAt;
  const window = input.window ?? "unspecified";

  const metrics = {};
  const resolverMetrics = {};

  for (const [name, definition] of Object.entries(contract.metrics)) {
    const hasMetric = Object.prototype.hasOwnProperty.call(supplied, name);
    const value = hasMetric ? toObservedValue(supplied[name]) : null;
    const observationState = hasMetric && supplied[name] != null ? "observed" : "unobserved";

    metrics[name] = {
      value,
      observation_state: observationState,
      source: definition.source,
      event: definition.event,
      filters: definition.filters,
    };
    resolverMetrics[name] = value;
  }

  const resolverInput = {
    route_id: contract.route.value,
    window,
    metrics: resolverMetrics,
  };
  const resolution = resolveRevenueBottleneck(resolverInput);
  const freshness = evaluateRevenueEvidenceFreshness({
    observed_at: observedAt,
    evaluated_at: evaluatedAt,
  });
  const safeAction = gateRevenueActionByFreshness(
    planSafeRevenueAction(resolution),
    freshness,
  );
  const snapshot = {
    version: 4,
    observed_at: observedAt,
    evaluated_at: evaluatedAt,
    window,
    analytics_scope: contract.scope.value,
    route_id: contract.route.value,
    metrics,
    evidence_rules: contract.evidence_rules,
    freshness,
    resolution,
    safe_action: safeAction,
  };

  return {
    ...snapshot,
    action_ticket: buildRevenueActionTicket(snapshot),
  };
}

async function runCli() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    console.error("Provide observed revenue metrics as JSON on stdin.");
    process.exitCode = 64;
    return;
  }
  const snapshot = await buildRevenuePulseSnapshot(JSON.parse(raw));
  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
