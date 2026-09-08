import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const config = JSON.parse(await fs.readFile(new URL('./config.json', import.meta.url), 'utf8'));
const now = new Date();
const githubToken = process.env.GITHUB_TOKEN || '';
const superteamKey = process.env.SUPERTEAM_AGENT_KEY || '';
const userAgent = 'vector-praxis-revenue-mesh/2.0';

const githubHeaders = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': userAgent,
  ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
};

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRewardUsd(text = '') {
  const values = [];
  const patterns = [
    /(?:\$|USD\s*|USDC\s*)([\d,]{1,10}(?:\.\d{1,2})?)/gi,
    /([\d,]{1,10}(?:\.\d{1,2})?)\s*(?:USD|USDC)\b/gi,
    /\/bounty\s+\$([\d,]{1,10}(?:\.\d{1,2})?)/gi,
  ];
  for (const pattern of patterns) {
    for (const match of String(text).matchAll(pattern)) {
      const amount = Number(match[1].replace(/,/g, ''));
      if (Number.isFinite(amount) && amount > 0 && amount <= 100000) values.push(amount);
    }
  }
  return values.length ? Math.max(...values) : 0;
}

function ageDays(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, (now.getTime() - date.getTime()) / 86400000);
}

function relativeAgeDays(amount, unit) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return null;
  const lower = String(unit).toLowerCase();
  if (lower.startsWith('day')) return n;
  if (lower.startsWith('week')) return n * 7;
  if (lower.startsWith('month')) return n * 30.44;
  if (lower.startsWith('year')) return n * 365.25;
  return null;
}

function inferHours(text = '', rewardUsd = 0) {
  const t = text.toLowerCase();
  let hours = 4;
  if (/typo|docs?|documentation|readme|broken link|copy|example/.test(t)) hours = 1.5;
  else if (/test|typing|schema|small fix|bug|cli|api/.test(t)) hours = 2.5;
  else if (/feature|integration|component|support for|add support/.test(t)) hours = 5;
  else if (/architecture|rewrite|rebuild|migration|compiler|kernel|distributed|refactor|on-device|native app/.test(t)) hours = 12;

  if (rewardUsd >= 10000) hours = Math.max(hours, 40);
  else if (rewardUsd >= 5000) hours = Math.max(hours, 24);
  else if (rewardUsd >= 2000) hours = Math.max(hours, 16);
  else if (rewardUsd >= 1000) hours = Math.max(hours, 10);
  else if (rewardUsd >= 500) hours = Math.max(hours, 6);

  return hours;
}

function containsAny(text, terms) {
  const lower = String(text).toLowerCase();
  return terms.some((term) => lower.includes(String(term).toLowerCase()));
}

function safetyReject(item) {
  const text = `${item.title}\n${item.body || ''}`;
  if (containsAny(text, config.safety.exclude_terms)) return 'excluded safety term';
  if (config.safety.require_explicit_reward && !item.rewardUsd) return 'reward not explicit';
  if (item.rewardUsd < config.thresholds.minimum_reward_usd) return 'reward below threshold';
  if ((item.competition || item.comments || 0) > config.thresholds.maximum_comments) return 'competition too high';
  if (item.ageDays != null && item.ageDays > config.thresholds.maximum_age_days) return 'too old';
  return null;
}

function rank(item) {
  const text = `${item.title} ${item.body || ''}`.toLowerCase();
  const hours = inferHours(text, item.rewardUsd);
  const competition = Number(item.competition || item.comments || 0);
  let winProbability = 0.78;

  if (competition) winProbability *= Math.max(0.28, 1 - competition / 35);
  if (item.ageDays != null) winProbability *= Math.max(0.32, 1 - item.ageDays / (config.thresholds.maximum_age_days * 1.4));
  if (containsAny(text, config.ranking.preferred_terms)) winProbability += 0.05;
  if (containsAny(text, config.ranking.deprioritize_terms)) winProbability -= 0.15;
  if (item.source === 'superteam-agent') winProbability += 0.08;
  if (item.source === 'algora' || item.source === 'algora-github') winProbability += 0.05;

  winProbability = Math.min(0.88, Math.max(0.1, winProbability));
  const expectedJpyPerHour = Math.round(
    (item.rewardUsd * config.currency.usd_jpy_assumption * winProbability) / hours,
  );

  return {
    ...item,
    estimatedHours: hours,
    estimatedWinProbability: Number(winProbability.toFixed(2)),
    expectedJpyPerHour,
  };
}

async function getJson(url, headers = {}) {
  const response = await fetch(url, { headers: { 'User-Agent': userAgent, ...headers } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function getText(url, headers = {}) {
  const response = await fetch(url, { headers: { 'User-Agent': userAgent, ...headers } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

async function githubSearch(query) {
  const url = new URL('https://api.github.com/search/issues');
  url.searchParams.set('q', query);
  url.searchParams.set('sort', 'updated');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', '30');
  const payload = await getJson(url, githubHeaders);
  return Array.isArray(payload.items) ? payload.items : [];
}

async function collectGithubSignals() {
  if (!config.sources.github_bounty_search && !config.sources.algora_comment_search) return [];

  const queries = [];
  if (config.sources.github_bounty_search) {
    queries.push('is:issue is:open label:bounty');
    queries.push('is:issue is:open reward in:title,body');
  }
  if (config.sources.algora_comment_search) {
    queries.push('is:issue is:open algora in:comments');
  }

  const seen = new Map();

  for (const query of queries) {
    let items = [];
    try {
      items = await githubSearch(query);
    } catch (error) {
      console.error(`GitHub search failed for ${query}:`, error.message);
      continue;
    }

    for (const issue of items) {
      if (issue.pull_request) continue;
      const repoMatch = issue.repository_url?.match(/repos\/([^/]+\/[^/]+)$/);
      const repo = repoMatch?.[1] || 'unknown/unknown';
      let extra = '';
      let source = 'github-bounty';

      if (query.includes('algora')) {
        try {
          const comments = await getJson(`${issue.comments_url}?per_page=30`, githubHeaders);
          extra = Array.isArray(comments) ? comments.map((comment) => comment.body || '').join('\n') : '';
          if (/algora\.io|\/bounty\s+\$/i.test(extra)) source = 'algora-github';
        } catch (error) {
          console.error(`Comment fetch failed for ${issue.html_url}:`, error.message);
        }
      }

      const combined = `${issue.title || ''}\n${issue.body || ''}\n${extra}`;
      const rewardUsd = extractRewardUsd(combined);
      const candidate = {
        id: `github:${issue.id}`,
        source,
        title: issue.title || `${repo}#${issue.number}`,
        body: stripHtml(issue.body || '').slice(0, 1200),
        url: issue.html_url,
        repo,
        rewardUsd,
        comments: Number(issue.comments || 0),
        competition: Number(issue.comments || 0),
        ageDays: ageDays(issue.created_at),
        updatedAt: issue.updated_at || null,
      };

      const previous = seen.get(candidate.url);
      if (!previous || candidate.rewardUsd > previous.rewardUsd || candidate.source === 'algora-github') {
        seen.set(candidate.url, candidate);
      }
    }
  }

  return [...seen.values()];
}

async function collectAlgoraPages() {
  const projects = Array.isArray(config.sources.algora_public_projects)
    ? config.sources.algora_public_projects
    : [];
  const candidates = [];

  for (const project of projects) {
    const pageUrl = `https://algora.io/${project}/bounties?status=open`;
    try {
      const html = await getText(pageUrl);
      const text = stripHtml(html);
      const starts = [...text.matchAll(/\$([\d,]+(?:\.\d+)?)\s+([A-Za-z0-9_.-]+)#(\d+)\s+/g)];

      for (let i = 0; i < starts.length; i += 1) {
        const match = starts[i];
        const rewardUsd = Number(match[1].replace(/,/g, ''));
        const repoName = match[2];
        const issueNumber = match[3];
        const start = (match.index || 0) + match[0].length;
        const end = i + 1 < starts.length ? starts[i + 1].index : Math.min(text.length, start + 1200);
        const segment = text.slice(start, end);
        const ageMatch = segment.match(/(\d+)\s+(day|days|week|weeks|month|months|year|years)\s+ago/i);
        const claimMatch = segment.match(/(\d+)\s+claims?/i);
        const titleEnd = ageMatch?.index ?? Math.min(segment.length, 180);
        const title = segment.slice(0, titleEnd).trim().replace(/\s+\|.*$/, '').slice(0, 180) || `${repoName}#${issueNumber}`;
        const age = ageMatch ? relativeAgeDays(ageMatch[1], ageMatch[2]) : null;
        const claims = claimMatch ? Number(claimMatch[1]) : 0;

        candidates.push({
          id: `algora:${project}:${repoName}#${issueNumber}:${rewardUsd}`,
          source: 'algora',
          title,
          body: `${repoName}#${issueNumber} | open Algora bounty | ${claims} claims`,
          url: pageUrl,
          repo: repoName,
          rewardUsd,
          comments: claims,
          competition: claims,
          ageDays: age,
          updatedAt: null,
        });
      }
    } catch (error) {
      console.error(`Algora page failed for ${project}:`, error.message);
    }
  }

  return candidates;
}

async function collectIssueHunt() {
  if (!config.sources.issuehunt_public_feed) return [];
  try {
    const html = await getText('https://oss.issuehunt.io/issues');
    const candidates = [];
    const linkPattern = /href=["']\/r\/([^/"']+)\/([^/"']+)\/issues\/(\d+)["'][^>]*>([\s\S]*?)<\/a>/gi;

    for (const match of html.matchAll(linkPattern)) {
      const [full, owner, repoName, issueNumber, anchorText] = match;
      const start = Math.max(0, (match.index || 0) - 600);
      const end = Math.min(html.length, (match.index || 0) + full.length + 1800);
      const window = html.slice(start, end);
      const rewardUsd = extractRewardUsd(window);
      if (!rewardUsd) continue;
      const repo = `${owner}/${repoName}`;
      const title = stripHtml(anchorText) || `${repo}#${issueNumber}`;
      candidates.push({
        id: `issuehunt:${repo}#${issueNumber}`,
        source: 'issuehunt',
        title,
        body: stripHtml(window).slice(0, 1000),
        url: `https://oss.issuehunt.io/r/${owner}/${repoName}/issues/${issueNumber}`,
        repo,
        rewardUsd,
        comments: 0,
        competition: 0,
        ageDays: 180,
        updatedAt: null,
      });
    }

    return candidates;
  } catch (error) {
    console.error('IssueHunt feed failed:', error.message);
    return [];
  }
}

function normalizeSuperteamListings(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ['listings', 'data', 'items', 'results']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

async function collectSuperteam() {
  if (!config.sources.superteam_agent_api?.enabled_when_secret_present || !superteamKey) return [];

  const deadline = new Date(now.getTime() + 120 * 86400000).toISOString().slice(0, 10);
  const url = `https://superteam.fun/api/agents/listings/live?take=50&deadline=${deadline}`;

  try {
    const payload = await getJson(url, { Authorization: `Bearer ${superteamKey}` });
    const listings = normalizeSuperteamListings(payload);
    return listings.map((listing) => {
      const serialized = JSON.stringify(listing);
      const rewardUsd = extractRewardUsd(serialized);
      const slug = listing.slug || listing.id || listing.listingId || '';
      return {
        id: `superteam:${listing.id || listing.listingId || slug}`,
        source: 'superteam-agent',
        title: listing.title || listing.name || `Superteam listing ${slug}`,
        body: stripHtml(listing.description || listing.content || serialized).slice(0, 1400),
        url: slug ? `https://superteam.fun/earn` : 'https://superteam.fun/earn',
        repo: null,
        rewardUsd,
        comments: 0,
        competition: 0,
        ageDays: ageDays(listing.createdAt || listing.created_at),
        updatedAt: listing.updatedAt || listing.updated_at || null,
      };
    });
  } catch (error) {
    console.error('Superteam Agent API failed:', error.message);
    return [];
  }
}

const raw = [
  ...(await collectGithubSignals()),
  ...(await collectAlgoraPages()),
  ...(await collectIssueHunt()),
  ...(await collectSuperteam()),
];

const deduped = [...new Map(raw.map((item) => [item.id, item])).values()];
const rejected = [];
const qualified = [];

for (const item of deduped) {
  const reason = safetyReject(item);
  if (reason) {
    rejected.push({ ...item, reason });
    continue;
  }
  const ranked = rank(item);
  if (ranked.expectedJpyPerHour < config.thresholds.minimum_expected_jpy_per_hour) {
    rejected.push({ ...ranked, reason: 'expected JPY/hour below threshold' });
    continue;
  }
  qualified.push(ranked);
}

qualified.sort((a, b) => b.expectedJpyPerHour - a.expectedJpyPerHour || b.rewardUsd - a.rewardUsd);
const top = qualified.slice(0, 12);
const fingerprint = crypto
  .createHash('sha256')
  .update(JSON.stringify(top.map((item) => [item.id, item.rewardUsd, item.expectedJpyPerHour])))
  .digest('hex')
  .slice(0, 16);

const lines = [
  '# Revenue Mesh Radar',
  '',
  `Last scan: ${now.toISOString()}`,
  `Scanned: ${deduped.length} | Actionable: ${qualified.length} | Cut: ${rejected.length}`,
  '',
  '> Expected JPY/hour is a ranking heuristic, not guaranteed income.',
  '',
];

if (top.length) {
  lines.push('| Source | Reward | EV / h | Win est. | Hours est. | Competition | Candidate |');
  lines.push('|---|---:|---:|---:|---:|---:|---|');
  for (const item of top) {
    const safeTitle = item.title.replace(/\|/g, '\\|').slice(0, 100);
    lines.push(
      `| ${item.source} | $${item.rewardUsd.toFixed(0)} | ¥${item.expectedJpyPerHour.toLocaleString()} | ${(item.estimatedWinProbability * 100).toFixed(0)}% | ${item.estimatedHours} | ${item.competition || item.comments || 0} | [${safeTitle}](${item.url}) |`,
    );
  }
  lines.push('', '## Execution order', '');
  lines.push('Work top-down. Before external submission, verify the live acceptance criteria, claimant eligibility, repository state, and payout path.');
} else {
  lines.push('No candidate currently clears the economic + safety gate.');
}

const report = `${lines.join('\n')}\n`;
await fs.writeFile('/tmp/revenue-mesh.md', report, 'utf8');
console.log(report);

if (process.env.GITHUB_OUTPUT) {
  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `has_actionable=${top.length > 0 ? 'true' : 'false'}\nfingerprint=${fingerprint}\nactionable_count=${top.length}\n`,
    'utf8',
  );
}
