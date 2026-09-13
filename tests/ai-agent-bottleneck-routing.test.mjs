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

test("bottleneck routing stays Vector-native and routes intent to the existing paid note", () => {
  assert.match(router, /note\.com\/deft_eel6718\/n\/ncaff8351e529/);
  assert.match(router, /FREE FIRST/);
  assert.match(router, /VECTOR DEEP DIVE/);
  assert.match(router, /vpj_owned_ai_agent_bottleneck_v2/);
  assert.doesNotMatch(router, /stratumpraxis\.com|cross-agent-operating-kit|ai-agent-economics-calculator/i);
});

test("bottleneck routing emits scoped measurable intent and next-action events", () => {
  assert.match(router, /vector_bottleneck_select/);
  assert.match(router, /vector_bottleneck_recommendation_view/);
  assert.match(router, /vector_bottleneck_next_click/);
  assert.match(router, /analytics_scope:\s*"vector_praxis_japan"/);
  assert.match(router, /destination_kind:\s*current\.kind/);
  assert.match(router, /data-event=\{current\.event\}/);
  assert.match(router, /asset_id/);
  assert.match(router, /route_id/);
});

test("article keeps Vector ownership boundaries and does not fabricate checkout evidence", () => {
  assert.match(page, /note\.com\/deft_eel6718\/n\/ncaff8351e529/);
  assert.match(page, /Vectorの有料note/);
  assert.match(page, /primary_cta_click/);
  assert.doesNotMatch(page + router, /stratumpraxis\.com|Cross-Agent Operating Kit|Agent Economics Calculator/i);
  assert.doesNotMatch(router + page, /purchase_success|verified_purchase|fake_checkout/i);
});
