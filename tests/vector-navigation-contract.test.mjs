import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Vector keeps the six-route public information architecture", async () => {
  const home = await read("app/page.tsx");
  for (const id of ["start", "build", "earn", "creator", "read", "return"]) {
    assert.match(home, new RegExp(`id:\\s*"${id}"`));
  }
  assert.match(home, /type RouteId = "start" \| "build" \| "earn" \| "creator" \| "read" \| "return"/);
});

test("Vector preserves current Sites canonical fallback", async () => {
  const siteUrl = await read("lib/site-url.ts");
  assert.match(siteUrl, /https:\/\/vector-praxis-japan\.user-ex26\.chatgpt\.site/);
});

test("Vector premium layer exposes the canonical public status vocabulary", async () => {
  const layer = await read("app/vector-premium-layer.tsx");
  for (const status of ["FREE", "PAID", "HUB", "EXTERNAL", "PAUSED"]) {
    assert.match(layer, new RegExp(`"${status}"`));
  }
  assert.match(layer, /READ.*HUB/);
  assert.match(layer, /GROUP.*EXTERNAL/);
});

test("Vector keeps explicit, privacy-aware measurement", async () => {
  const layout = await read("app/layout.tsx");
  assert.match(layout, /autocapture:false/);
  assert.match(layout, /disable_session_recording:true/);
  assert.match(layout, /person_profiles:"never"/);
  assert.match(layout, /VectorPremiumLayer/);
});

test("Linked library keeps Vector and Stratum ownership boundaries explicit", async () => {
  const library = await read("app/library/page.tsx");
  assert.match(library, /所有ブランドは混ぜない/);
  assert.match(library, /B2B商品・監査・業務意思決定の主体はStratum側に残します/);
  assert.match(library, /https:\/\/payhip\.com\/b\/LBtbr/);
  assert.match(library, /https:\/\/stratumpraxis\.com\//);
});
