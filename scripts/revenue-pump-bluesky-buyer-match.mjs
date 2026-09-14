import fs from 'node:fs';

const outPath = new URL('../distribution/revenue-pump-buyer-match-last-run.json', import.meta.url);
const queries = [
  'AI うまくいかない',
  'AI 面倒 自分',
  '自動化 面倒 自分',
  '手作業 自動化 自分',
  'コピペ 自動化 面倒',
  'Claude Code 遅い',
  'AIエージェント 詰まる',
  'AI 手作業の方が早い',
];
const painTerms = [
  '遅い','遅く','詰ま','手作業','コピペ','待ち','待つ','権限','引き継','面倒','止ま','うまくいか','貼り直','時間かか','手作業の方が早',
  'slow','stuck','manual','copy paste','handoff','permission','waiting','bottleneck',
];
const unresolvedTerms = [
  '困','悩','つら','面倒','できない','うまくいか','遅い','遅く','詰ま','止ま','時間かか','待つ','貼り直','手作業の方が早','どうすれば','ないかな','わからない',
];
const personalTerms = ['自分','私','僕','俺','うち','毎回','結局','いつも','やってる','使ってる','作ってる','試してる','したい'];
const buyerTerms = ['仕事','業務','開発','運用','workflow','agent','エージェント','github','claude','chatgpt','自動化','ai'];
const sellerTerms = ['note.com','¥','販売','有料','完全版','プロンプト集','大公開','今すぐ','見逃し','購入','詳細はこちら','booth.pm'];
const broadcastTerms = ['みなさん','教えてください','事例が出ました','解説します','紹介します','ニュース','まとめ','必見','〜しませんか'];
const solvedTerms = ['解決しました','解消しました','改善しました','減りました','終わった','できた','完了した','短縮でき','自動化でき'];
const service = process.env.BLUESKY_PDS_URL || 'https://bsky.social';
const handle = process.env.BLUESKY_HANDLE;
const password = process.env.BLUESKY_APP_PASSWORD;
const maxAgeDays = 7;
const freshnessCutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
if (!handle || !password) throw new Error('bluesky_credentials_missing');

const sessionResponse = await fetch(`${service}/xrpc/com.atproto.server.createSession`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ identifier: handle, password }),
});
if (!sessionResponse.ok) throw new Error(`bluesky_session_http_${sessionResponse.status}`);
const session = await sessionResponse.json();
if (!session.accessJwt) throw new Error('bluesky_access_jwt_missing');

function matchTerms(text, terms) {
  const t = text.toLowerCase();
  return terms.filter((term) => t.includes(term.toLowerCase()));
}

function evaluate(text = '') {
  const matchedPain = matchTerms(text, painTerms);
  const matchedUnresolved = matchTerms(text, unresolvedTerms);
  const matchedPersonal = matchTerms(text, personalTerms);
  const matchedBuyer = matchTerms(text, buyerTerms);
  const matchedSeller = matchTerms(text, sellerTerms);
  const matchedBroadcast = matchTerms(text, broadcastTerms);
  const matchedSolved = matchTerms(text, solvedTerms);
  const sellerLike = matchedSeller.length >= 1;
  const broadcastLike = matchedBroadcast.length >= 1;
  const solvedLike = matchedSolved.length >= 1;
  const problemClear = matchedPain.length >= 1 && matchedUnresolved.length >= 1;
  const personalPain = matchedPersonal.length >= 1;
  const buyerFit = matchedBuyer.length >= 1;
  const score = matchedPain.length * 5 + matchedUnresolved.length * 5 + matchedPersonal.length * 4 + matchedBuyer.length * 2
    - matchedSeller.length * 10 - matchedBroadcast.length * 8 - matchedSolved.length * 10;
  return {
    score, matchedPain, matchedUnresolved, matchedPersonal, matchedBuyer,
    matchedSeller, matchedBroadcast, matchedSolved,
    sellerLike, broadcastLike, solvedLike, problemClear, personalPain, buyerFit,
  };
}

const seen = new Map();
for (const q of queries) {
  const endpoint = new URL(`${service}/xrpc/app.bsky.feed.searchPosts`);
  endpoint.searchParams.set('q', q);
  endpoint.searchParams.set('sort', 'latest');
  endpoint.searchParams.set('limit', '50');
  const response = await fetch(endpoint, {
    headers: {
      authorization: `Bearer ${session.accessJwt}`,
      'user-agent': 'VectorPraxis-RevenuePump/1.0',
    },
  });
  if (!response.ok) throw new Error(`bluesky_search_http_${response.status}:${q}`);
  const payload = await response.json();
  for (const post of payload.posts ?? []) {
    const indexedAt = post.indexedAt ?? null;
    const indexedMs = indexedAt ? Date.parse(indexedAt) : NaN;
    if (!Number.isFinite(indexedMs) || indexedMs < freshnessCutoff) continue;
    const text = post?.record?.text ?? '';
    const ev = evaluate(text);
    if (ev.sellerLike || ev.broadcastLike || ev.solvedLike) continue;
    if (!ev.problemClear || !ev.personalPain || !ev.buyerFit) continue;
    if (post.author?.handle === handle) continue;
    const ageHours = Math.round((Date.now() - indexedMs) / 36e5);
    const freshnessBonus = Math.max(0, Math.round((maxAgeDays * 24 - ageHours) / 24));
    const item = {
      uri: post.uri,
      cid: post.cid,
      author_handle: post.author?.handle ?? null,
      author_display_name: post.author?.displayName ?? null,
      text,
      indexed_at: indexedAt,
      age_hours: ageHours,
      like_count: Number(post.likeCount ?? 0),
      reply_count: Number(post.replyCount ?? 0),
      repost_count: Number(post.repostCount ?? 0),
      quote_count: Number(post.quoteCount ?? 0),
      score: ev.score + freshnessBonus,
      matched_pain: ev.matchedPain,
      matched_unresolved: ev.matchedUnresolved,
      matched_personal: ev.matchedPersonal,
      matched_buyer: ev.matchedBuyer,
      source_query: q,
      revenue_fit: 'existing_ai_agent_bottleneck_diagnostic',
    };
    const current = seen.get(post.uri);
    if (!current || item.score > current.score) seen.set(post.uri, item);
  }
}

const candidates = [...seen.values()]
  .sort((a,b) => b.score - a.score || a.age_hours - b.age_hours)
  .slice(0, 6);

const evidence = {
  version: 5,
  observed_at: new Date().toISOString(),
  platform: 'bluesky',
  asset_id: 'ai_agent_bottleneck',
  route_id: 'vpj_owned_ai_agent_bottleneck_v2',
  max_age_days: maxAgeDays,
  query_count: queries.length,
  candidate_count: candidates.length,
  candidates,
  decision_rule: 'Market/problem first: unresolved personal pain + buyer fit + existing-asset fit. No seller/broadcast/solved posts. One contact at a time.',
  next_gate: 'Do not contact unless candidate text clearly describes the author’s own unresolved workflow pain.',
};

fs.writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
