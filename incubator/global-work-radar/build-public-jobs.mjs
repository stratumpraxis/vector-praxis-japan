import { readFile, writeFile } from 'node:fs/promises';

const LEVER = new URL('./data/lever-verified-seed.json', import.meta.url);
const WORKABLE = new URL('./data/workable-current.json', import.meta.url);
const OUT = new URL('./data/verified-jobs.json', import.meta.url);

const readJson = async (url, fallback) => {
  try { return JSON.parse(await readFile(url, 'utf8')); } catch { return fallback; }
};

const lever = await readJson(LEVER, { records: [] });
const workable = await readJson(WORKABLE, { records: [] });

const workablePublic = (workable.records || [])
  .filter((job) => job.publishable === true && job.verification_status === 'verified_active')
  .map((job) => ({
    id: job.id,
    employer: job.employer,
    title: job.title,
    category: job.category,
    location: job.location || job.eligible_region || 'Location not specified',
    remote: job.remote_type,
    japan: job.japan_eligible === true,
    japanese: job.japanese_required === true,
    english: job.english_level,
    payMin: job.compensation_min,
    payMax: job.compensation_max,
    currency: job.compensation_currency,
    period: job.compensation_period,
    verified: `Verified ${String(job.last_verified_at || '').slice(0, 10)}`,
    status: 'VERIFIED ACTIVE',
    url: job.official_url,
    source: 'Workable',
    confidence: job.japan_eligibility_confidence >= 0.8 ? 'high' : 'medium',
    eligibilityEvidence: job.eligibility_evidence || null,
    publishedAt: job.published_at || null,
    firstSeenAt: job.first_seen_at || null
  }));

const merged = [...(lever.records || []), ...workablePublic];
const seen = new Set();
const records = merged.filter((job) => {
  const key = String(job.url || job.id || '').toLowerCase();
  if (!key || seen.has(key)) return false;
  seen.add(key);
  return true;
});

const output = {
  generated_at: new Date().toISOString(),
  policy: 'verified_active_structured_facts_only',
  source_counts: {
    lever: (lever.records || []).length,
    workable_publishable: workablePublic.length
  },
  count: records.length,
  records
};

await writeFile(OUT, JSON.stringify(output, null, 2) + '\n');
console.log(`GWR public jobs built: ${records.length}`);
