import fs from 'node:fs';
import crypto from 'node:crypto';

const ROOT = 'incubator/global-work-radar';
const INPUT = `${ROOT}/data/verified-jobs.json`;
const OUTPUT = `${ROOT}/data/gwr-social-growth-candidates.json`;
const BASE_URL = 'https://global-work-radar.pages.dev/';

const text = (value) => typeof value === 'string' ? value.trim() : '';
const compact = (value, max = 180) => {
  const normalized = text(value).replace(/\s+/g, ' ');
  return normalized.length <= max ? normalized : `${normalized.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
};
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
const finite = (value) => Number.isFinite(Number(value)) ? Number(value) : null;

function trackedUrl(candidateId, extra = {}) {
  const url = new URL(BASE_URL);
  url.searchParams.set('japan', '1');
  url.searchParams.set('utm_source', 'social');
  url.searchParams.set('utm_medium', 'organic');
  url.searchParams.set('utm_campaign', 'gwr_signal_growth');
  url.searchParams.set('utm_content', candidateId);
  for (const [key, value] of Object.entries(extra)) {
    if (value !== null && value !== undefined && String(value).trim()) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function scoreJob(job) {
  let score = 0;
  if (job.japan === true) score += 35;
  if (job.status === 'VERIFIED ACTIVE') score += 15;
  if (job.remote === 'remote') score += 8;
  if (job.freshness?.bucket === 'NEW_24H') score += 25;
  else if (job.freshness?.bucket === 'NEW_3D') score += 20;
  else if (job.freshness?.bucket === 'FRESH_7D') score += 12;
  if (job.hiringMomentum?.state === 'NEW_EMPLOYER_SIGNAL') score += 14;
  else if (job.hiringMomentum?.state === 'HIRING_UP') score += Math.min(18, 8 + Math.max(0, finite(job.hiringMomentum?.delta) || 0));
  if (finite(job.payMin)) score += Math.min(12, Math.max(0, Number(job.payMin)) / 5);
  if (job.url && /^https:\/\//i.test(job.url)) score += 8;
  return Number(score.toFixed(1));
}

function payLabel(job) {
  const min = finite(job.payMin);
  if (min === null) return '';
  const max = finite(job.payMax);
  const currency = text(job.currency) || 'USD';
  const period = job.period === 'hour' ? '/h' : job.period ? `/${job.period}` : '';
  const range = max !== null && max !== min ? `${min}–${max}` : String(min);
  return `${currency} ${range}${period}`;
}

function evidenceForJob(job) {
  return {
    job_id: text(job.id) || null,
    employer: text(job.employer) || null,
    title: text(job.title) || null,
    source: text(job.source) || null,
    official_url: /^https:\/\//i.test(text(job.url)) ? text(job.url) : null,
    last_verified_at: text(job.lastVerifiedAt) || null,
    freshness_bucket: text(job.freshness?.bucket) || null,
    hiring_momentum: text(job.hiringMomentum?.state) || null,
    hiring_delta: finite(job.hiringMomentum?.delta),
  };
}

function buildOpenCandidate(job) {
  const identity = ['OPEN', job.id, job.lastVerifiedAt, job.hiringMomentum?.state];
  const candidateId = `gwr-open-${hash(identity)}`;
  const destinationUrl = trackedUrl(candidateId, {
    q: job.employer || job.title || '',
    intent: job.remote === 'remote' ? 'remote' : 'general',
  });
  const bits = [text(job.title), text(job.employer), text(job.location)].filter(Boolean);
  const pay = payLabel(job);
  const core = `${bits.join('｜')}${pay ? `｜${pay}` : ''}`;
  const follow = 'GWRは日本から確認できる海外求人の変化を継続観測中。';
  return {
    candidate_id: candidateId,
    signal_type: 'GWR_OPEN',
    objective: 'qualified_follower_growth',
    score: scoreJob(job),
    source_generated_at: null,
    claim_scope: 'verified_active_structured_facts_only',
    text: {
      x: compact(`【GWR OPEN】${core}。公式求人の確認先まで検証済み。${follow} ${destinationUrl}`, 275),
      bluesky: compact(`GWR OPEN｜${core}。公式求人まで確認済み。${follow} ${destinationUrl}`, 295),
      linkedin: compact(`Global Work Radarで新しい求人Signalを確認。\n\n${core}\n\n公開対象はVERIFIED ACTIVEかつ公式応募先を確認できたものに限定しています。GWRは日本から確認できる海外求人の変化を継続観測しています。\n\n${destinationUrl}`, 900),
    },
    destination_url: destinationUrl,
    evidence: [evidenceForJob(job)],
    measurement_chain: ['social_publish', 'gwr_visit', 'gwr_return_visit', 'gwr_search', 'gwr_official_apply_click'],
    publish_state: 'CANDIDATE_NOT_PUBLISHED',
    channel_rule: 'GWR_CHANNEL_ONLY',
  };
}

function buildAlertCandidate(job) {
  const identity = ['ALERT', job.id, job.freshness?.bucket, job.lastVerifiedAt];
  const candidateId = `gwr-alert-${hash(identity)}`;
  const destinationUrl = trackedUrl(candidateId, { q: job.employer || '', intent: 'general' });
  const delta = finite(job.hiringMomentum?.delta);
  const momentum = job.hiringMomentum?.state === 'NEW_EMPLOYER_SIGNAL'
    ? 'GWR観測内で新規Employer Signal'
    : job.hiringMomentum?.state === 'HIRING_UP' && delta !== null
      ? `前回スナップショット比 +${delta}`
      : '新着Signal';
  const core = `${text(job.employer)}｜${text(job.title)}｜${momentum}`;
  return {
    candidate_id: candidateId,
    signal_type: 'GWR_ALERT',
    objective: 'qualified_follower_growth',
    score: scoreJob(job) + 7,
    source_generated_at: null,
    claim_scope: 'snapshot_change_only_no_hiring_outcome_inference',
    text: {
      x: compact(`【GWR ALERT】${core}。日本対象可否・公式求人・鮮度を確認して追跡しています。次の変化もGWRで更新。 ${destinationUrl}`, 275),
      bluesky: compact(`GWR ALERT｜${core}。日本対象可否・公式求人・鮮度を確認して継続追跡。 ${destinationUrl}`, 295),
      linkedin: compact(`GWR Market Alert\n\n${core}\n\nこれは採用結果の予測ではなく、GWRの検証済み求人スナップショットで確認できた変化です。日本対象可否・公式求人・鮮度を継続追跡します。\n\n${destinationUrl}`, 900),
    },
    destination_url: destinationUrl,
    evidence: [evidenceForJob(job)],
    measurement_chain: ['social_publish', 'gwr_visit', 'gwr_return_visit', 'gwr_search', 'gwr_official_apply_click'],
    publish_state: 'CANDIDATE_NOT_PUBLISHED',
    channel_rule: 'GWR_CHANNEL_ONLY',
  };
}

function buildShiftCandidate(momentum, records) {
  const matching = records.filter((job) => job.employer === momentum.employer && job.japan === true && job.status === 'VERIFIED ACTIVE').slice(0, 4);
  if (!matching.length || !(momentum.delta > 0)) return null;
  const identity = ['SHIFT', momentum.employer, momentum.previous_count, momentum.current_count];
  const candidateId = `gwr-shift-${hash(identity)}`;
  const destinationUrl = trackedUrl(candidateId, { q: momentum.employer, intent: 'general' });
  const core = `${momentum.employer}：GWR確認求人 ${momentum.previous_count}→${momentum.current_count}（+${momentum.delta}）`;
  return {
    candidate_id: candidateId,
    signal_type: 'GWR_SHIFT',
    objective: 'qualified_follower_growth',
    score: 70 + Math.min(25, momentum.delta * 4) + Math.min(10, matching.length * 2),
    source_generated_at: null,
    claim_scope: 'verified_inventory_snapshot_delta_only',
    text: {
      x: compact(`【GWR SHIFT】${core}。採用成否の予測ではなく、検証済み公開求人のスナップショット変化です。変化を継続追跡。 ${destinationUrl}`, 275),
      bluesky: compact(`GWR SHIFT｜${core}。検証済み公開求人のスナップショット変化として継続追跡。 ${destinationUrl}`, 295),
      linkedin: compact(`GWR Market Shift\n\n${core}\n\nこれは企業の採用意欲や採用成否を断定するものではなく、GWRで確認できたVERIFIED ACTIVE求人のスナップショット差分です。次回更新でも同じEmployerを追跡します。\n\n${destinationUrl}`, 900),
    },
    destination_url: destinationUrl,
    evidence: matching.map(evidenceForJob),
    measurement_chain: ['social_publish', 'gwr_visit', 'gwr_return_visit', 'gwr_search', 'gwr_official_apply_click'],
    publish_state: 'CANDIDATE_NOT_PUBLISHED',
    channel_rule: 'GWR_CHANNEL_ONLY',
  };
}

function buildDataCandidate(category, stats, records) {
  if (!stats || finite(stats.sample_count) === null || Number(stats.sample_count) < 3 || finite(stats.median_usd_hourly) === null) return null;
  const evidenceJobs = records.filter((job) => job.category === category && job.currency === 'USD' && job.period === 'hour' && job.japan === true).slice(0, 5);
  if (evidenceJobs.length < 2) return null;
  const identity = ['DATA', category, stats.sample_count, stats.median_usd_hourly];
  const candidateId = `gwr-data-${hash(identity)}`;
  const destinationUrl = trackedUrl(candidateId, { category, intent: 'highpay' });
  const core = `${category}｜GWR検証在庫 ${stats.sample_count}件｜時給下限中央値 $${stats.median_usd_hourly}`;
  return {
    candidate_id: candidateId,
    signal_type: 'GWR_DATA',
    objective: 'qualified_follower_growth',
    score: 58 + Math.min(22, Number(stats.sample_count)),
    source_generated_at: null,
    claim_scope: 'gwr_verified_inventory_only_not_market_wide',
    text: {
      x: compact(`【GWR DATA】${core}。市場全体ではなくGWR検証在庫内の集計です。求人変化と一緒に継続更新。 ${destinationUrl}`, 275),
      bluesky: compact(`GWR DATA｜${core}。市場全体ではなくGWR検証在庫内の集計。継続更新します。 ${destinationUrl}`, 295),
      linkedin: compact(`GWR Data Snapshot\n\n${core}\n\n対象はGlobal Work Radarで検証できた公開求人のみで、市場全体の統計ではありません。同じ定義で継続観測し、変化が出たときに比較できる状態を作っています。\n\n${destinationUrl}`, 900),
    },
    destination_url: destinationUrl,
    evidence: evidenceJobs.map(evidenceForJob),
    measurement_chain: ['social_publish', 'gwr_visit', 'gwr_return_visit', 'gwr_search', 'gwr_official_apply_click'],
    publish_state: 'CANDIDATE_NOT_PUBLISHED',
    channel_rule: 'GWR_CHANNEL_ONLY',
  };
}

if (!fs.existsSync(INPUT)) throw new Error(`Missing GWR input: ${INPUT}`);
const source = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const records = Array.isArray(source.records) ? source.records : [];
if (!records.length) throw new Error('GWR verified inventory is empty');

const eligible = records
  .filter((job) => job.japan === true && job.status === 'VERIFIED ACTIVE' && /^https:\/\//i.test(text(job.url)))
  .sort((a, b) => scoreJob(b) - scoreJob(a));

const candidates = [];
for (const job of eligible.slice(0, 6)) candidates.push(buildOpenCandidate(job));
for (const job of eligible.filter((job) => ['NEW_24H', 'NEW_3D'].includes(job.freshness?.bucket)).slice(0, 4)) candidates.push(buildAlertCandidate(job));
for (const momentum of (source.intelligence?.employer_momentum || []).filter((item) => item?.delta > 0).slice(0, 5)) {
  const candidate = buildShiftCandidate(momentum, records);
  if (candidate) candidates.push(candidate);
}
for (const [category, stats] of Object.entries(source.intelligence?.category_pay_usd_hourly || {})) {
  const candidate = buildDataCandidate(category, stats, records);
  if (candidate) candidates.push(candidate);
}

const deduped = [...new Map(candidates.map((candidate) => [candidate.candidate_id, candidate])).values()]
  .sort((a, b) => b.score - a.score)
  .slice(0, 12)
  .map((candidate, index) => ({ ...candidate, source_generated_at: source.generated_at || null, rank: index + 1 }));

const output = {
  generated_at: new Date().toISOString(),
  source_generated_at: source.generated_at || null,
  brand: 'Global Work Radar',
  purpose: 'Turn verified market changes into follower-acquisition social candidates without fabricating publication state.',
  channel_policy: 'GWR_CHANNEL_ONLY',
  publication_policy: 'candidate_generation_only_until_a_GWR_owned_social_channel_is_verified',
  safety: {
    no_easy_hire_claims: true,
    no_income_guarantees: true,
    no_group_eligibility_inference: true,
    no_cross_brand_vector_account_use: true,
    official_apply_remains_external: true,
  },
  kpi_order: ['official_apply_evidence', 'qualified_gwr_action', 'gwr_return_visit', 'qualified_social_visit', 'qualified_follow', 'reach'],
  candidate_count: deduped.length,
  candidates: deduped,
};

fs.mkdirSync(`${ROOT}/data`, { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
console.log(`GWR social growth candidates built: ${deduped.length}`);
if (deduped[0]) console.log(`GWR_SOCIAL_TOP=${deduped[0].candidate_id} score=${deduped[0].score}`);
