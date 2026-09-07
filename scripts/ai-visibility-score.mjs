import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function parseRecords(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.results)) return parsed.results;
    throw new Error('JSON must be an array or an object with a results array');
  } catch (jsonError) {
    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    try {
      return lines.map((line) => JSON.parse(line));
    } catch {
      throw jsonError;
    }
  }
}

function percentage(numerator, denominator) {
  return denominator === 0 ? 0 : Number(((numerator / denominator) * 100).toFixed(2));
}

function includesAny(text, needles) {
  const haystack = String(text || '').toLowerCase();
  return needles.some((needle) => haystack.includes(String(needle).toLowerCase()));
}

function citationMatches(citations, domains) {
  return (citations || []).some((citation) => {
    const value = typeof citation === 'string' ? citation : citation?.url;
    if (!value) return false;
    try {
      const host = new URL(value).hostname.toLowerCase();
      return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
    } catch {
      return false;
    }
  });
}

export function scoreVisibility(results, config) {
  const aliases = config.target?.aliases || [];
  const domains = (config.target?.owned_domains || []).map((domain) => domain.toLowerCase());
  const promptIds = new Set((config.prompts || []).map((item) => item.id));
  const seenPromptIds = new Set();

  const normalized = results.map((result, index) => {
    if (!result.prompt_id || !result.provider || !result.model || typeof result.answer !== 'string') {
      throw new Error(`result[${index}] requires prompt_id, provider, model, and answer`);
    }
    if (promptIds.size && !promptIds.has(result.prompt_id)) {
      throw new Error(`result[${index}] uses unknown prompt_id '${result.prompt_id}'`);
    }

    seenPromptIds.add(result.prompt_id);
    const mentioned = includesAny(result.answer, aliases);
    const ownedCitation = citationMatches(result.citations, domains);

    return {
      ...result,
      mentioned,
      owned_citation: ownedCitation
    };
  });

  const providers = new Map();
  for (const row of normalized) {
    const key = row.provider;
    if (!providers.has(key)) providers.set(key, { total: 0, mentions: 0, owned_citations: 0 });
    const bucket = providers.get(key);
    bucket.total += 1;
    if (row.mentioned) bucket.mentions += 1;
    if (row.owned_citation) bucket.owned_citations += 1;
  }

  const mentions = normalized.filter((row) => row.mentioned).length;
  const ownedCitations = normalized.filter((row) => row.owned_citation).length;

  return {
    target: config.target?.name || 'unknown',
    total_results: normalized.length,
    configured_prompts: promptIds.size,
    observed_prompts: seenPromptIds.size,
    prompt_coverage_rate: percentage(seenPromptIds.size, promptIds.size),
    mention_count: mentions,
    mention_rate: percentage(mentions, normalized.length),
    owned_citation_count: ownedCitations,
    owned_citation_rate: percentage(ownedCitations, normalized.length),
    by_provider: Object.fromEntries(
      [...providers.entries()].map(([provider, bucket]) => [provider, {
        ...bucket,
        mention_rate: percentage(bucket.mentions, bucket.total),
        owned_citation_rate: percentage(bucket.owned_citations, bucket.total)
      }])
    )
  };
}

export function loadResults(filePath) {
  return parseRecords(fs.readFileSync(filePath, 'utf8'));
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  const resultPath = process.argv[2];
  const configPath = process.argv[3] || path.join(process.cwd(), 'research-lab', 'evals', 'ai-visibility.prompts.json');

  if (!resultPath) {
    console.error('Usage: npm run visibility:score -- <results.json|results.jsonl> [prompts.json]');
    process.exit(2);
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const summary = scoreVisibility(loadResults(resultPath), config);
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(`AI visibility score failed: ${error.message}`);
    process.exit(1);
  }
}
