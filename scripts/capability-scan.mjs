import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { scoreRepository } from "../capability-lab/scoring.mjs";

const root = process.cwd();
const configPath = path.join(root, "capability-lab", "config.json");
const evidenceDir = path.join(root, "capability-lab", "evidence");
const latestPath = path.join(evidenceDir, "latest.json");
const queuePath = path.join(root, "capability-lab", "queue.md");

const config = JSON.parse(await fs.readFile(configPath, "utf8"));
const token = process.env.GITHUB_TOKEN || "";
const now = new Date();

const githubHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "vector-praxis-capability-lab",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function readPrevious() {
  try {
    const parsed = JSON.parse(await fs.readFile(latestPath, "utf8"));
    return new Map((parsed.candidates ?? []).map((item) => [item.full_name, item]));
  } catch {
    return new Map();
  }
}

async function github(pathname) {
  const response = await fetch(`https://api.github.com${pathname}`, { headers: githubHeaders });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub ${response.status} ${pathname}: ${body.slice(0, 300)}`);
  }
  return response.json();
}

async function searchRepositories(query) {
  const params = new URLSearchParams({
    q: query,
    sort: "updated",
    order: "desc",
    per_page: String(config.max_per_query ?? 8),
  });
  const result = await github(`/search/repositories?${params}`);
  return result.items ?? [];
}

async function fetchRepository(fullName) {
  return github(`/repos/${fullName}`);
}

function extractRepoNames(text) {
  const matches = new Set();
  const regex = /\b([A-Za-z0-9_.-]{1,39}\/[-A-Za-z0-9_.]{1,100})\b/g;
  const denyOwners = new Set(["topics", "trending", "showcase", "assets", "static", "images"]);
  let match;
  while ((match = regex.exec(text))) {
    const fullName = match[1].replace(/[.,;:)\]]+$/, "");
    const [owner, repo] = fullName.split("/");
    if (!owner || !repo || denyOwners.has(owner.toLowerCase())) continue;
    matches.add(fullName);
    if (matches.size >= (config.max_gitgem_candidates ?? 20) * 4) break;
  }
  return [...matches];
}

async function discoverGitGem(sensor) {
  try {
    const response = await fetch(sensor.url, {
      headers: { "User-Agent": "vector-praxis-capability-lab" },
    });
    if (!response.ok) return [];
    const text = await response.text();
    const raw = extractRepoNames(text);
    const confirmed = [];
    for (const fullName of raw) {
      if (confirmed.length >= (config.max_gitgem_candidates ?? 20)) break;
      try {
        const repo = await fetchRepository(fullName);
        confirmed.push(repo);
      } catch {
        // GitGem HTML can contain non-repository owner/name strings; ignore them.
      }
    }
    return confirmed;
  } catch {
    return [];
  }
}

function compactRepo(repo) {
  return {
    id: repo.id,
    full_name: repo.full_name,
    name: repo.name,
    html_url: repo.html_url,
    description: repo.description,
    topics: repo.topics ?? [],
    stargazers_count: repo.stargazers_count ?? 0,
    forks_count: repo.forks_count ?? 0,
    open_issues_count: repo.open_issues_count ?? 0,
    pushed_at: repo.pushed_at,
    updated_at: repo.updated_at,
    created_at: repo.created_at,
    archived: Boolean(repo.archived),
    fork: Boolean(repo.fork),
    default_branch: repo.default_branch,
    language: repo.language,
    license: repo.license ? { key: repo.license.key, name: repo.license.name, spdx_id: repo.license.spdx_id } : null,
  };
}

const previous = await readPrevious();
const discovered = new Map();

function add(repo, source) {
  if (!repo?.full_name) return;
  const current = discovered.get(repo.full_name) ?? { repo, sources: new Set() };
  current.repo = repo;
  current.sources.add(source);
  discovered.set(repo.full_name, current);
}

for (const fullName of config.seed_repositories ?? []) {
  try {
    add(await fetchRepository(fullName), "seed");
  } catch (error) {
    console.warn(`seed fetch failed: ${fullName}: ${error.message}`);
  }
}

for (const query of config.github_queries ?? []) {
  try {
    for (const repo of await searchRepositories(query)) add(repo, `github-search:${query}`);
  } catch (error) {
    console.warn(`search failed: ${query}: ${error.message}`);
  }
}

for (const sensor of config.external_sensors ?? []) {
  if (sensor.name === "GitGem") {
    for (const repo of await discoverGitGem(sensor)) add(repo, "gitgem");
  }
}

const candidates = [...discovered.values()].map(({ repo, sources }) => {
  const compact = compactRepo(repo);
  const scored = scoreRepository(compact, previous.get(compact.full_name), now);
  return {
    ...compact,
    sources: [...sources].sort(),
    ...scored,
  };
});

candidates.sort((a, b) => b.score - a.score || b.star_delta - a.star_delta || b.stargazers_count - a.stargazers_count);

const output = {
  schema_version: 1,
  generated_at: now.toISOString(),
  run: {
    github_repository: process.env.GITHUB_REPOSITORY ?? null,
    github_run_id: process.env.GITHUB_RUN_ID ?? null,
    github_sha: process.env.GITHUB_SHA ?? null,
  },
  policy: {
    priority_threshold: config.priority_threshold,
    sandbox_threshold: config.sandbox_threshold,
    auto_install: false,
    rule: "Discovery and metadata scoring are automatic. Installation or production adoption requires isolated sandbox verification and explicit KEEP evidence.",
  },
  counts: {
    discovered: candidates.length,
    priority: candidates.filter((item) => item.score >= config.priority_threshold).length,
    sandbox_queue: candidates.filter((item) => item.score >= config.sandbox_threshold).length,
  },
  candidates,
};

function mdCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function renderMarkdown() {
  const priority = candidates.filter((item) => item.score >= config.priority_threshold);
  const sandbox = candidates.filter((item) => item.score >= config.sandbox_threshold);
  const lines = [
    "# Capability Acquisition Queue",
    "",
    `Generated: ${output.generated_at}`,
    "",
    "> External signal → primary GitHub metadata → score → isolated sandbox → KEEP/KILL. Discovery never auto-installs third-party code.",
    "",
    `Discovered: **${candidates.length}** · Priority: **${priority.length}** · Sandbox queue: **${sandbox.length}**`,
    "",
    "## Priority sandbox",
    "",
    "| Score | Repository | Target | Stars | Δ | License | Source | Decision |",
    "|---:|---|---|---:|---:|---|---|---|",
  ];

  for (const item of priority.slice(0, 20)) {
    lines.push(`| ${item.score} | [${mdCell(item.full_name)}](${item.html_url}) | ${mdCell(item.target)} | ${item.stargazers_count} | +${item.star_delta} | ${mdCell(item.license?.spdx_id ?? "UNKNOWN")} | ${mdCell(item.sources.join(", "))} | ${item.decision} |`);
  }
  if (!priority.length) lines.push("| - | No candidate crossed the priority gate | - | - | - | - | - | - |");

  lines.push("", "## Sandbox queue", "");
  for (const item of sandbox.slice(0, 25)) {
    lines.push(`### ${item.score} · ${item.full_name}`);
    lines.push(`- **Target:** ${item.target}`);
    lines.push(`- **Primary source:** ${item.html_url}`);
    lines.push(`- **License preflight:** ${item.license?.spdx_id ?? "UNKNOWN"} — re-check repository license/terms before commercial adoption.`);
    lines.push(`- **Test:** ${item.sandbox_test}`);
    lines.push(`- **KEEP gate:** measurable capability gain + reproducible artifact/test evidence + acceptable license/security/dependency risk.`);
    lines.push("");
  }

  lines.push("## Kill rules", "", "- Archived or materially stale upstream.", "- License/terms incompatible with intended commercial use.", "- No measurable capability gain over the existing stack.", "- Sandbox needs broad credentials, unsafe host access, or irreversible side effects.", "- Cannot produce reproducible proof-of-work.", "");
  return `${lines.join("\n")}\n`;
}

await fs.mkdir(evidenceDir, { recursive: true });
const dateKey = now.toISOString().slice(0, 10);
await fs.writeFile(latestPath, `${JSON.stringify(output, null, 2)}\n`);
await fs.writeFile(path.join(evidenceDir, `${dateKey}.json`), `${JSON.stringify(output, null, 2)}\n`);
await fs.writeFile(queuePath, renderMarkdown());

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath) await fs.appendFile(summaryPath, renderMarkdown());

console.log(`Capability scan complete: ${candidates.length} candidates, ${output.counts.priority} priority, ${output.counts.sandbox_queue} sandbox.`);
