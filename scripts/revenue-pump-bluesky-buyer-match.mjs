import fs from 'node:fs';

const outPath = new URL('../distribution/revenue-pump-buyer-match-last-run.json', import.meta.url);
const queries = [
  'AIエージェント',
  'Claude Code',
  'ChatGPT Claude',
  'AI 自動化',
];
const painTerms = [
  '遅い','遅く','詰ま','手作業','コピペ','待ち','権限','引き継','面倒','止ま','うまくいか',
  'slow','stuck','manual','copy paste','handoff','permission','waiting','bottleneck',
];
const buyerTerms = ['仕事','業務','開発','運用','workflow','agent','エージェント','github','claude','chatgpt'];

function score(text = '') {
  const t = text.toLowerCase();
  let s = 0;
  const matchedPain = [];
  const matchedBuyer = [];
  for (const term of painTerms) if (t.includes(term.toLowerCase())) { s += 3; matchedPain.push(term); }
  for (const term of buyerTerms) if (t.includes(term.toLowerCase())) { s += 1; matchedBuyer.push(term); }
  return { score: s, matchedPain, matchedBuyer };
}

const seen = new Map();
for (const q of queries) {
  const endpoint = new URL('https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts');
  endpoint.searchParams.set('q', q);
  endpoint.searchParams.set('sort', 'latest');
  endpoint.searchParams.set('limit', '50');
  const response = await fetch(endpoint, { headers: { 'user-agent': 'VectorPraxis-RevenuePump/1.0' } });
  if (!response.ok) throw new Error(`bluesky_search_http_${response.status}:${q}`);
  const payload = await response.json();
  for (const post of payload.posts ?? []) {
    const text = post?.record?.text ?? '';
    const scored = score(text);
    if (scored.matchedPain.length === 0 || scored.matchedBuyer.length === 0) continue;
    if (post.author?.handle === 'vectorpx.bsky.social') continue;
    const current = seen.get(post.uri);
    const item = {
      uri: post.uri,
      cid: post.cid,
      author_handle: post.author?.handle ?? null,
      author_display_name: post.author?.displayName ?? null,
      text,
      indexed_at: post.indexedAt ?? null,
      like_count: Number(post.likeCount ?? 0),
      reply_count: Number(post.replyCount ?? 0),
      repost_count: Number(post.repostCount ?? 0),
      quote_count: Number(post.quoteCount ?? 0),
      score: scored.score,
      matched_pain: scored.matchedPain,
      matched_buyer: scored.matchedBuyer,
      source_query: q,
    };
    if (!current || item.score > current.score) seen.set(post.uri, item);
  }
}

const candidates = [...seen.values()]
  .sort((a,b) => b.score - a.score || Date.parse(b.indexed_at || 0) - Date.parse(a.indexed_at || 0))
  .slice(0, 12);

const evidence = {
  version: 1,
  observed_at: new Date().toISOString(),
  platform: 'bluesky',
  asset_id: 'ai_agent_bottleneck',
  route_id: 'vpj_owned_ai_agent_bottleneck_v2',
  query_count: queries.length,
  candidate_count: candidates.length,
  candidates,
  rule: 'Discovery only. Do not count a candidate as Buyer Reaction until the person engages or takes a downstream action.',
};

fs.writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
