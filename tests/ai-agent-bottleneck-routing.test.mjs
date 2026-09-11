import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const routerPath = new URL("../app/ai-agent-bottleneck/bottleneck-router.tsx", import.meta.url);
const pagePath = new URL("../app/ai-agent-bottleneck/page.tsx", import.meta.url);

const router = await readFile(routerPath, "utf8");
const page = await readFile(pagePath, "utf8");

test("bottleneck routing uses only the three declared operational bottlenecks", () => {
  for (const id of ['id: "wait"', 'id: "authority"', 'id: "handoff"']) assert.match(router, new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("bottleneck routing sends wait to free economics measurement and rule/handoff to the existing operating kit", () => {
  assert.match(router, /ai-agent-economics-calculator\.html/);
  assert.match(router, /cross-agent-operating-kit\.html/);
  assert.match(router, /FREE FIRST/);
  assert.match(router, /PAID IMPLEMENTATION/);
});

test("bottleneck routing emits measurable intent and next-action events", () => {
  assert.match(router, /vector_bottleneck_select/);
  assert.match(router, /vector_bottleneck_recommendation_view/);
  assert.match(router, /vector_bottleneck_next_click/);
  assert.match(router, /data-event=\{current\.event\}/);
});

test("article keeps existing downstream routes and does not fabricate checkout evidence", () => {
  assert.match(page, /Cross-Agent Operating Kit/);
  assert.match(page, /Agent Economics Calculator|無料で計算する/);
  assert.doesNotMatch(router + page, /purchase_success|verified_purchase|fake_checkout/i);
});
