#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HN = 'https://hacker-news.firebaseio.com/v0';
const DEFAULT_LIMIT = 60;

export const ROUTES = [
  {
    id: 'multi-agent-governance',
    keywords: ['agent', 'agents', 'multi-agent', 'multi agent', 'claude', 'codex', 'chatgpt', 'llm'],
    asset: { name: 'Agent Control Auditor', url: 'https://stratumpraxis.com/agent-control-auditor.html' },
    fallback_asset: { name: 'Cross-Agent Operating Kit', url: 'https://stratumpraxis.com/cross-agent-operating-kit.html' },
    cell: 'Publishing Revenue Cell'
  },
  {
    id: 'workflow-automation',
    keywords: ['automation', 'automate', 'workflow', 'agentic', 'operations', 'process'],
    asset: { name: 'AI Automation ROI Calculator', url: 'https://roi.stratumpraxis.com/' },
    fallback_asset: { name: 'AI Workflow Consultant', url: 'https://stratumpraxis.com/ai-consultant.html' },
    cell: 'Publishing Revenue Cell'
  },
  {
    id: 'saas-spend',
    keywords: ['saas', 'subscription', 'license', 'billing', 'spend', 'cost', 'pricing'],
    asset: { name: 'AI & SaaS Waste Calculator', url: 'https://stratumpraxis.com/ai-saas-waste-calculator.html' },
    fallback_asset: { name: 'AI & SaaS Spend Decision Kit', url: 'https://stratumpraxis.com/ai-saas-spend-decision-kit.html' },
    cell: 'Publishing Revenue Cell'
  },
  {
    id: 'monetization-offer',
    keywords: ['revenue', 'monetize', 'monetization', 'sell', 'selling', 'offer', 'pricing', 'customers', 'customer'],
    asset: { name: 'AI Monetization Reality Check', url: 'https://stratumpraxis.com/ai-monetization-reality-check.html' },
    fallback_asset: { name: 'Revenue Router', url: 'https://stratumpraxis.com/revenue-router.html' },
    cell: 'Publishing Revenue Cell'
  }
];

function textOf(item) {
  return `${item?.title ?? ''} ${item?.text ?? ''}`.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function classifyItem(item, nowSec = Math.floor(Date.now() / 1000)) {
  const text = textOf(item).toLowerCase();
  const ageHours = Math.max(0, (nowSec - Number(item?.time ?? nowSec)) / 3600);
  const matches = [];

  for (const route of ROUTES) {
    const matched = route.keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
    if (matched.length) {
      matches.push({ route, matched });
    }
  }

  if (!matches.length) return null;

  matches.sort((a, b) => b.matched.length - a.matched.length);
  const best = matches[0];
  const discussion = Math.min(20, Number(item?.descendants ?? 0));
  const votes = Math.min(20, Number(item?.score ?? 0));
  const recency = ageHours <= 24 ? 20 : ageHours <= 72 ? 12 : 4;
  const keywordStrength = Math.min(30, best.matched.length * 10);
  const askBonus = item?.type === 'story' && /^ask hn/i.test(item?.title ?? '') ? 10 : 0;
  const signalScore = Math.min(100, discussion + votes + recency + keywordStrength + askBonus);

  return {
    route_id: best.route.id,
    matched_keywords: best.matched,
    signal_score: signalScore,
    confidence: signalScore >= 70 ? 'HIGH' : signalScore >= 50 ? 'MEDIUM' : 'LOW',
    existing_asset_match: best.route.asset,
    fallback_asset: best.route.fallback_asset,
    handoff_cell: best.route.cell
  };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'MARKET-External-Nervous-System/1.0' },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function mapLimit(values, limit, fn) {
  const out = [];
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      try {
        const value = await fn(values[index], index);
        if (value) out.push(value);
      } catch (error) {
        out.push({ __fetch_error: true, id: values[index], error: String(error?.message ?? error) });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return out;
}

export async function scanHackerNews({ limit = DEFAULT_LIMIT } = {}) {
  const [askIds, showIds] = await Promise.all([
    fetchJson(`${HN}/askstories.json`),
    fetchJson(`${HN}/showstories.json`)
  ]);

  const selectedIds = [...askIds.slice(0, limit), ...showIds.slice(0, Math.floor(limit / 2))];
  const items = await mapLimit(selectedIds, 8, (id) => fetchJson(`${HN}/item/${id}.json`));
  const nowSec = Math.floor(Date.now() / 1000);
  const candidates = [];
  const fetchErrors = [];

  for (const item of items) {
    if (item?.__fetch_error) {
      fetchErrors.push(item);
      continue;
    }
    if (!item || item.deleted || item.dead) continue;
    const classification = classifyItem(item, nowSec);
    if (!classification) continue;
    candidates.push({ item, classification });
  }

  candidates.sort((a, b) => b.classification.signal_score - a.classification.signal_score);
  const winner = candidates[0] ?? null;

  const evidence = {
    schema_version: 1,
    sensor: 'hacker-news-official-api',
    source: 'Hacker News Official API (Firebase)',
    source_endpoint: `${HN}/`,
    read_only: true,
    auth_required: false,
    observed_at: new Date().toISOString(),
    sampled_ids: selectedIds.length,
    fetched_items: items.length - fetchErrors.length,
    fetch_errors: fetchErrors.length,
    candidate_count: candidates.length,
    state_transition: winner ? ['CONNECTED', 'VERIFIED', 'ON_DEMAND'] : ['CONNECTED'],
    top_signal: winner ? {
      event_id: `hn-${winner.item.id}`,
      source_event_id: String(winner.item.id),
      timestamp: new Date(Number(winner.item.time) * 1000).toISOString(),
      title: winner.item.title,
      author: winner.item.by,
      hn_url: `https://news.ycombinator.com/item?id=${winner.item.id}`,
      external_url: winner.item.url ?? null,
      score: winner.item.score ?? 0,
      comments: winner.item.descendants ?? 0,
      classification: winner.classification,
      fact: 'A public Hacker News item matching deterministic MARKET keywords exists and was returned by the official API.',
      inference: `The discussion may indicate ${winner.classification.route_id} demand/pain worth editorial or market validation.`,
      hypothesis: 'This signal could progress toward a qualified visit or paid route after external validation; purchase intent is not established.',
      handoff: {
        cell: winner.classification.handoff_cell,
        action: 'Validate external demand and decide whether to route the matched existing asset; do not create a new product.',
        asset: winner.classification.existing_asset_match
      }
    } : null
  };

  return evidence;
}

async function main() {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf('--out');
  const limitIndex = args.indexOf('--limit');
  const out = outIndex >= 0 ? args[outIndex + 1] : null;
  const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : DEFAULT_LIMIT;
  const evidence = await scanHackerNews({ limit: Number.isFinite(limit) ? limit : DEFAULT_LIMIT });

  if (out) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, `${JSON.stringify(evidence, null, 2)}\n`);
  }

  console.log(JSON.stringify(evidence, null, 2));
  if (!evidence.top_signal) process.exitCode = 2;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
