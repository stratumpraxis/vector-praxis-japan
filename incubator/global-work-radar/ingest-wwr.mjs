import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const FEED_URL = 'https://weworkremotely.com/remote-jobs.rss';
const OUT = new URL('./data/staging-wwr.json', import.meta.url);

const decode = (s = '') => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .trim();

const textTag = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? decode(m[1]) : '';
};

const stripHtml = (s = '') => decode(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));

const splitTitle = (raw) => {
  const parts = raw.split(':');
  if (parts.length < 2) return { employer: '', title: raw.trim() };
  return { employer: parts.shift().trim(), title: parts.join(':').trim() };
};

const classifyCategory = (text) => {
  const t = text.toLowerCase();
  if (/support|customer success|customer service/.test(t)) return 'Customer Support';
  if (/translation|translator/.test(t)) return 'Translation';
  if (/locali[sz]ation|linguist/.test(t)) return 'Localization';
  if (/annotat|labeling|data collection/.test(t)) return 'Data Annotation';
  if (/evaluator|rater|search quality|ads quality|ai trainer|model trainer/.test(t)) return 'AI Trainer / Evaluator';
  return 'Remote Contractor';
};

const infer = (text) => {
  const t = text.toLowerCase();
  const japanese = /\bjapanese\b|日本語|nihongo/.test(t);
  const japanExplicit = /\bjapan\b|日本/.test(t);
  const worldwide = /anywhere in the world|worldwide|global remote/.test(t);
  const excludedJapan = /except japan|excluding japan|not available in japan/.test(t);

  let japanEligible = null;
  let confidence = 'low';
  let reason = 'No explicit Japan eligibility signal found.';

  if (excludedJapan) {
    japanEligible = false;
    confidence = 'high';
    reason = 'Listing text explicitly excludes Japan.';
  } else if (japanExplicit) {
    japanEligible = true;
    confidence = 'medium';
    reason = 'Listing text explicitly references Japan; manual verification still required.';
  } else if (worldwide) {
    japanEligible = true;
    confidence = 'medium';
    reason = 'Listing describes worldwide/global remote eligibility; manual verification still required.';
  }

  return { japaneseRequired: japanese, japanEligible, confidence, reason };
};

const canonicalKey = ({ employer, title, link }) => createHash('sha256')
  .update(`${employer.toLowerCase()}|${title.toLowerCase()}|${link}`)
  .digest('hex')
  .slice(0, 24);

const res = await fetch(FEED_URL, {
  headers: {
    'user-agent': 'GlobalWorkRadar/0.1 (+https://weworkremotely.com/remote-job-rss-feed)'
  }
});

if (!res.ok) throw new Error(`WWR RSS fetch failed: ${res.status} ${res.statusText}`);

const xml = await res.text();
const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((m) => m[1]);
const verifiedAt = new Date().toISOString();

const seen = new Set();
const records = [];

for (const item of items) {
  const rawTitle = textTag(item, 'title');
  const link = textTag(item, 'link');
  const description = stripHtml(textTag(item, 'description'));
  const pubDate = textTag(item, 'pubDate');
  if (!rawTitle || !link) continue;

  const { employer, title } = splitTitle(rawTitle);
  const combined = `${rawTitle} ${description}`;
  const eligibility = infer(combined);
  const key = canonicalKey({ employer, title, link });
  if (seen.has(key)) continue;
  seen.add(key);

  records.push({
    id: `wwr-${key}`,
    canonical_key: key,
    source_name: 'We Work Remotely',
    source_url: link,
    official_url: null,
    attribution: 'We Work Remotely',
    employer: employer || null,
    title,
    location: null,
    remote_type: 'remote',
    japan_eligible: eligibility.japanEligible,
    japan_eligible_confidence: eligibility.confidence,
    japan_eligible_reason: eligibility.reason,
    japanese_required: eligibility.japaneseRequired,
    english_level: null,
    employment_type: null,
    compensation_min: null,
    compensation_max: null,
    compensation_currency: null,
    compensation_period: null,
    category: classifyCategory(combined),
    first_seen_at: pubDate ? new Date(pubDate).toISOString() : verifiedAt,
    last_verified_at: verifiedAt,
    source_status: 'active',
    source_policy: 'rss',
    publishable: false,
    publish_blocker: 'Official employer/application URL has not been independently verified yet.'
  });
}

await mkdir(new URL('./data/', import.meta.url), { recursive: true });
await writeFile(OUT, JSON.stringify({
  source: 'we-work-remotely',
  feed_url: FEED_URL,
  fetched_at: verifiedAt,
  count: records.length,
  policy: 'fail_closed',
  records
}, null, 2) + '\n');

console.log(`GWR WWR ingest complete: ${records.length} staged records`);
console.log(`Output: ${OUT.pathname}`);
