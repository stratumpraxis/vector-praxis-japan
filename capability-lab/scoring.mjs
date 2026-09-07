const PERMISSIVE = new Set([
  "mit",
  "apache-2.0",
  "bsd-2-clause",
  "bsd-3-clause",
  "isc",
  "unlicense",
]);

const COPYLEFT = new Set(["gpl-2.0", "gpl-3.0", "lgpl-2.1", "lgpl-3.0", "agpl-3.0"]);

const CAPABILITY_TERMS = [
  "agent",
  "agentic",
  "codex",
  "mcp",
  "skill",
  "automation",
  "browser",
  "computer use",
  "rag",
  "retrieval",
  "eval",
  "evaluation",
  "testing",
  "observability",
  "workflow",
  "translation",
  "pdf",
  "video",
  "cli",
  "scrape",
  "crawler",
  "sandbox",
  "orchestration",
];

const OPERABILITY_TERMS = ["cli", "api", "mcp", "codex", "skill", "sdk", "command line", "agent"];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizedText(repo) {
  return [repo.name, repo.description, ...(repo.topics ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function keywordHits(text, terms) {
  return terms.filter((term) => text.includes(term)).length;
}

export function licenseScore(spdx) {
  const key = String(spdx ?? "").toLowerCase();
  if (PERMISSIVE.has(key)) return 15;
  if (COPYLEFT.has(key)) return 8;
  if (!key || key === "noassertion" || key === "other") return 2;
  return 5;
}

export function activityScore(pushedAt, now = new Date()) {
  if (!pushedAt) return 0;
  const ageDays = Math.max(0, (now.getTime() - new Date(pushedAt).getTime()) / 86_400_000);
  if (ageDays <= 14) return 15;
  if (ageDays <= 30) return 12;
  if (ageDays <= 90) return 8;
  if (ageDays <= 180) return 4;
  return 0;
}

export function adoptionScore(stars = 0) {
  if (stars >= 50_000) return 10;
  if (stars >= 10_000) return 8;
  if (stars >= 1_000) return 6;
  if (stars >= 100) return 4;
  if (stars >= 20) return 2;
  return 0;
}

export function velocityScore(delta = 0) {
  if (delta >= 500) return 10;
  if (delta >= 100) return 8;
  if (delta >= 20) return 6;
  if (delta >= 5) return 4;
  if (delta > 0) return 2;
  return 0;
}

export function inferTarget(repo) {
  const text = normalizedText(repo);
  if (/job|career|scrap|crawl|browser|search|dataset|recruit/.test(text)) return "GWR";
  if (/video|audio|caption|render|media|animation/.test(text)) return "Forwelle";
  if (/distribution|social|ranking|recommend|content/.test(text)) return "Stratum/Vector Distribution";
  if (/agent|codex|mcp|eval|test|observability|workflow|cli|sandbox/.test(text)) return "MARKET Engineering";
  return "Capability Lab";
}

export function sandboxTestFor(repo) {
  const target = inferTarget(repo);
  const text = normalizedText(repo);
  if (/browser|crawl|scrap/.test(text)) return `Sandbox: run one read-only public-web extraction task for ${target}; verify deterministic output, no credential access, and bounded network scope.`;
  if (/video|render|animation/.test(text)) return `Sandbox: generate one 10-20s disposable sample for ${target}; verify local reproducibility, artifact hash, runtime, and license compatibility.`;
  if (/pdf|translation|document/.test(text)) return `Sandbox: process one disposable document end-to-end; verify page/text preservation, artifact hash, and no external data leakage.`;
  if (/agent|codex|mcp|eval|test|workflow|cli/.test(text)) return `Sandbox: apply to one throwaway coding task; require tests, diff, proof-of-work, bounded retries, and zero irreversible side effects.`;
  return "Sandbox: isolated install, minimal happy-path task, artifact verification, dependency/license review, then KEEP/KILL.";
}

export function scoreRepository(repo, previous = null, now = new Date()) {
  const text = normalizedText(repo);
  const stars = Number(repo.stargazers_count ?? 0);
  const previousStars = Number(previous?.stargazers_count ?? stars);
  const starDelta = Math.max(0, stars - previousStars);

  const components = {
    capability_gain: clamp(keywordHits(text, CAPABILITY_TERMS) * 4, 0, 20),
    activity: activityScore(repo.pushed_at, now),
    commercial_license: licenseScore(repo.license?.spdx_id),
    agent_operability: clamp(keywordHits(text, OPERABILITY_TERMS) * 2, 0, 10),
    adoption: adoptionScore(stars),
    velocity: velocityScore(starDelta),
    project_fit: inferTarget(repo) === "Capability Lab" ? 4 : 10,
    testability: /cli|api|sdk|tool|library|framework|agent|workflow/.test(text) ? 10 : 6,
  };

  let penalties = 0;
  if (repo.archived) penalties += 25;
  if (repo.fork) penalties += 4;
  if (!repo.license?.spdx_id || ["NOASSERTION", "OTHER"].includes(repo.license?.spdx_id)) penalties += 5;
  if (activityScore(repo.pushed_at, now) === 0) penalties += 10;

  const raw = Object.values(components).reduce((sum, value) => sum + value, 0) - penalties;
  const score = clamp(Math.round(raw), 0, 100);

  return {
    score,
    components,
    penalties,
    star_delta: starDelta,
    target: inferTarget(repo),
    sandbox_test: sandboxTestFor(repo),
    decision: score >= 90 ? "PRIORITY_SANDBOX" : score >= 75 ? "SANDBOX_QUEUE" : score >= 60 ? "WATCH" : "KILL_OR_IGNORE",
  };
}
