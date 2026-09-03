import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';

const FEED_URL = 'https://www.workable.com/boards/workable.xml';
const DATA_DIR = new URL('./data/', import.meta.url);
const CURRENT_FILE = new URL('./data/workable-current.json', import.meta.url);
const STATE_FILE = new URL('./data/workable-state.json', import.meta.url);
const HISTORY_FILE = new URL('./data/workable-history.jsonl', import.meta.url);
const MARKET_FILE = new URL('./data/workable-market.json', import.meta.url);

const decode = (value = '') => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return m ? decode(m[1]) : '';
};
const stripHtml = (v = '') => decode(v.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
const sha = (v) => createHash('sha256').update(v).digest('hex');
const idFor = (ref, url) => `workable-${(ref || sha(url).slice(0, 16)).toLowerCase()}`;
const iso = (v) => { if (!v) return null; const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d.toISOString(); };
const readJson = async (url, fallback) => { try { return JSON.parse(await readFile(url, 'utf8')); } catch { return fallback; } };

const inferEligibility = ({ country, text }) => {
  const t = `${country} ${text}`.toLowerCase();
  if (/\b(japan|jp)\b|日本/.test(t)) return { japan_eligible: true, confidence: 0.9, eligible_region: 'Japan', evidence: 'Explicit Japan signal in source facts.' };
  if (/worldwide|anywhere in the world|global remote/.test(t)) return { japan_eligible: true, confidence: 0.7, eligible_region: 'Worldwide', evidence: 'Explicit worldwide/global remote signal.' };
  if (/us only|united states only|must reside in the us|u\.s\. only/.test(t)) return { japan_eligible: false, confidence: 0.9, eligible_region: 'US only', evidence: 'Explicit US-only restriction.' };
  return { japan_eligible: country.toUpperCase() === 'JP' ? true : null, confidence: country.toUpperCase() === 'JP' ? 0.8 : 0.2, eligible_region: country || null, evidence: country.toUpperCase() === 'JP' ? 'Country field is JP.' : 'No reliable Japan-eligibility evidence.' };
};

const classify = (title, category, text) => {
  const t = `${title} ${category} ${text}`.toLowerCase();
  if (/evaluator|rater|ai trainer|model trainer|quality rater/.test(t)) return 'AI Trainer / Evaluator';
  if (/annotat|labeling|data collection/.test(t)) return 'Data Annotation';
  if (/locali[sz]ation|linguist/.test(t)) return 'Localization';
  if (/translation|translator/.test(t)) return 'Translation';
  if (/customer support|customer service|customer success/.test(t)) return 'Customer Support';
  return category || 'Other';
};

const observedAt = new Date().toISOString();
const previousState = await readJson(STATE_FILE, { jobs: {}, last_observed_at: null });
const previousJobs = previousState.jobs || {};
const records = [];
const nextStateJobs = {};
let sawJob = false;

const processJob = (item) => {
  const title = tag(item, 'title');
  const company = tag(item, 'company');
  const ref = tag(item, 'referencenumber');
  const url = tag(item, 'url');
  if (!title || !company || !url) return;
  sawJob = true;
  const city = tag(item, 'city'); const state = tag(item, 'state'); const country = tag(item, 'country');
  const remote = tag(item, 'remote').toLowerCase() === 'true';
  const description = stripHtml(tag(item, 'description'));
  const jobType = tag(item, 'jobtype'); const sourceCategory = tag(item, 'category'); const experience = tag(item, 'experience');
  const location = [city, state, country].filter(Boolean).join(', ') || null;
  const eligibility = inferEligibility({ country, text: `${title} ${description}` });
  const japaneseRequired = /\bjapanese\b|日本語|nihongo/i.test(`${title} ${description}`);
  const id = idFor(ref, url);
  const fingerprint = sha(JSON.stringify({ title, company, url, city, state, country, remote, jobType, sourceCategory, experience }));
  const prev = previousJobs[id];
  const changeType = !prev ? 'first_seen' : prev.fingerprint === fingerprint ? 'unchanged' : 'changed';
  const record = {
    id, canonical_key: sha(`${company.toLowerCase()}|${title.toLowerCase()}|${url}`).slice(0, 24),
    source_name: 'Workable', source_url: url, official_url: url, source_reference: ref || null,
    employer: company, title, location, eligible_region: eligibility.eligible_region, eligibility_evidence: eligibility.evidence,
    remote_type: remote ? 'remote' : 'unknown', japan_eligible: eligibility.japan_eligible,
    japan_eligibility_confidence: eligibility.confidence, japanese_required: japaneseRequired, english_level: null,
    employment_type: jobType || null, compensation_min: null, compensation_max: null, compensation_currency: null,
    compensation_period: null, category: classify(title, sourceCategory, description), published_at: iso(tag(item, 'date')),
    first_seen_at: prev?.first_seen_at || observedAt, last_verified_at: observedAt, expires_at: null, closed_at: null,
    verification_status: 'verified_active', source_status: 'active', source_policy: 'feed', source_attribution: 'Workable',
    quality_score: eligibility.japan_eligible === true ? 0.85 : 0.65,
    publishable: eligibility.japan_eligible === true || japaneseRequired, change_type: changeType, fingerprint
  };
  records.push(record);
  nextStateJobs[id] = { fingerprint, first_seen_at: record.first_seen_at, last_seen_at: observedAt, missing_count: 0, closed_at: null, title, employer: company };
};

const response = await fetch(FEED_URL, { headers: { 'user-agent': 'GlobalWorkRadar/0.3' } });
if (!response.ok || !response.body) throw new Error(`Workable feed fetch failed: ${response.status} ${response.statusText}`);
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';
while (true) {
  const { value, done } = await reader.read();
  if (value) buffer += decoder.decode(value, { stream: !done });
  let start;
  while ((start = buffer.search(/<job(?:\s[^>]*)?>/i)) >= 0) {
    const endMatch = buffer.slice(start).match(/<\/job>/i);
    if (!endMatch) break;
    const end = start + endMatch.index + endMatch[0].length;
    processJob(buffer.slice(start, end));
    buffer = buffer.slice(end);
  }
  if (buffer.length > 2_000_000 && !/<job/i.test(buffer)) buffer = buffer.slice(-2000);
  if (done) break;
}
if (!sawJob) throw new Error('Workable feed failed structural validation: no jobs found.');

const historyEvents = records.filter((r) => r.change_type !== 'unchanged').map((r) => ({ job_id: r.id, observed_at: observedAt, verification_status: r.verification_status, fingerprint: r.fingerprint, change_type: r.change_type }));
let closedNow = 0;
for (const [id, prev] of Object.entries(previousJobs)) {
  if (nextStateJobs[id]) continue;
  const missingCount = (prev.missing_count || 0) + 1;
  nextStateJobs[id] = { ...prev, missing_count: missingCount, closed_at: missingCount >= 2 ? (prev.closed_at || observedAt) : prev.closed_at || null };
  if (missingCount >= 2 && !prev.closed_at) {
    closedNow++;
    historyEvents.push({ job_id: id, observed_at: observedAt, verification_status: 'closed', fingerprint: prev.fingerprint, change_type: 'closed' });
  }
}

const active = records.length;
const japanEligible = records.filter((j) => j.japan_eligible === true).length;
const japanese = records.filter((j) => j.japanese_required).length;
const remote = records.filter((j) => j.remote_type === 'remote').length;
const newJobs = records.filter((j) => j.change_type === 'first_seen').length;
const employerCounts = new Map(); for (const j of records) employerCounts.set(j.employer, (employerCounts.get(j.employer) || 0) + 1);
const recurringEmployers = [...employerCounts.values()].filter((n) => n > 1).length;
const survivalDays = records.map((j) => (new Date(observedAt) - new Date(j.first_seen_at)) / 86400000).filter((n) => Number.isFinite(n) && n >= 0).sort((a,b)=>a-b);
const median = (arr) => arr.length ? arr.length % 2 ? arr[(arr.length - 1) / 2] : (arr[arr.length/2 - 1] + arr[arr.length/2]) / 2 : null;
const market = { source: 'workable', snapshot_at: observedAt, active_jobs: active, japan_eligible_jobs: japanEligible, japanese_jobs: japanese, remote_jobs: remote, new_jobs_since_previous_snapshot: newJobs, closed_jobs_confirmed_this_snapshot: closedNow, remote_ratio: active ? remote / active : 0, employer_recurrence_count: recurringEmployers, median_observed_survival_days: median(survivalDays), intelligence_status: previousState.last_observed_at ? 'history_available' : 'baseline_only' };

await mkdir(DATA_DIR, { recursive: true });
await writeFile(CURRENT_FILE, JSON.stringify({ source: 'workable', fetched_at: observedAt, count: records.length, records }, null, 2) + '\n');
await writeFile(STATE_FILE, JSON.stringify({ source: 'workable', last_observed_at: observedAt, jobs: nextStateJobs }, null, 2) + '\n');
await writeFile(MARKET_FILE, JSON.stringify(market, null, 2) + '\n');
if (historyEvents.length) await appendFile(HISTORY_FILE, historyEvents.map((e) => JSON.stringify(e)).join('\n') + '\n');
console.log(JSON.stringify(market, null, 2));
