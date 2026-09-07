import test from "node:test";
import assert from "node:assert/strict";
import {
  activityScore,
  inferTarget,
  licenseScore,
  scoreRepository,
  velocityScore,
} from "../capability-lab/scoring.mjs";

test("permissive licenses pass the commercial preflight more strongly than unknown licenses", () => {
  assert.equal(licenseScore("MIT"), 15);
  assert.equal(licenseScore("Apache-2.0"), 15);
  assert.ok(licenseScore(null) < licenseScore("MIT"));
});

test("recent activity scores above stale activity", () => {
  const now = new Date("2026-09-07T00:00:00Z");
  assert.equal(activityScore("2026-09-01T00:00:00Z", now), 15);
  assert.equal(activityScore("2025-01-01T00:00:00Z", now), 0);
});

test("velocity rewards new external momentum", () => {
  assert.equal(velocityScore(0), 0);
  assert.ok(velocityScore(120) > velocityScore(5));
});

test("project targeting routes browser/crawler capability toward GWR", () => {
  assert.equal(
    inferTarget({ name: "agent-crawler", description: "Browser crawler for jobs", topics: ["agent"] }),
    "GWR",
  );
});

test("strong active agent tooling reaches sandbox gates while stale unknown tooling is penalized", () => {
  const now = new Date("2026-09-07T00:00:00Z");
  const strong = {
    name: "agent-cli",
    description: "Codex MCP agent CLI workflow automation testing observability",
    topics: ["agent", "codex", "mcp", "cli", "workflow", "testing"],
    stargazers_count: 12000,
    pushed_at: "2026-09-06T00:00:00Z",
    archived: false,
    fork: false,
    license: { spdx_id: "MIT" },
  };
  const weak = {
    name: "old-tool",
    description: "misc utility",
    topics: [],
    stargazers_count: 10,
    pushed_at: "2023-01-01T00:00:00Z",
    archived: true,
    fork: false,
    license: null,
  };

  const strongScore = scoreRepository(strong, { stargazers_count: 11000 }, now);
  const weakScore = scoreRepository(weak, null, now);
  assert.ok(strongScore.score >= 75);
  assert.ok(weakScore.score < 60);
  assert.equal(weakScore.decision, "KILL_OR_IGNORE");
});
