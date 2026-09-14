import fs from 'node:fs';

const outPath = new URL('../distribution/revenue-pump-buyer-match-last-run.json', import.meta.url);
const queries = [
  'AI 手作業',
  'AI コピペ',
  'Claude Code 遅い',
  'AIエージェント 待ち',
  '自動化 面倒',
  'ChatGPT コピペ',
  'Claude Code 手作業',
  'AI 引き継ぎ',
];
const painTerms = [
  '遅い','遅く','詰ま','手作業','コピペ','待ち','待つ','権限','引き継','面倒','止ま','うまくいか','貼り直','時間かか',
  'slow','stuck','manual','copy paste','handoff','permission','waiting','bottleneck',
];
const buyerTerms = ['仕事','業務','開発','運用','workflow','agent','エージェント','github','claude','chatgpt','自動化'];
const intentTerms = ['困','悩','つら','面倒','毎回','結局','自分','したい','できない','ないかな','どうすれば','時間かか','待つ','貼り直','コピペ','手作業'];
const sellerTerms = ['note.com','¥','販売','有料','完全版','プロンプト集','大公開','今すぐ','見逃し','購入'];
const service = process.env.BLUESKY_PDS_URL || 'https://bsky.social';
const handle = process.env.BLUESKY_HANDLE;
const password = process.env.BLUESKY_APP_PASSWORD;
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
  const matchedBuyer = matchTerms(text, buyerTerms);
  const matchedIntent = matchTerms(text, intentTerms);
  const matchedSeller = matchTerms(text, sellerTerms);
  const sellerLike = matchedSeller.length >= 2;
  const score = matchedPain.length * 4 + matchedIntent.length * 3 + matchedBuyer.length - matchedSeller.length * 5;
  return { score, matchedPain, matchedBuyer, matchedIntent, matchedSeller, sellerLike };
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
    const text = post?.record?.text ?? '';
    const ev = evaluate(text);
    if (ev.sellerLike) continue;
    if (ev.matchedPain.length === 0 || ev.matchedBuyer.length === 0 || ev.matchedIntent.length === 0) continue;
    if (post.author?.handle === handle) continue;
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
      score: ev.score,
      matched_pain: ev.matchedPain,
      matched_intent: ev.matchedIntent,
      matched_buyer: ev.matchedBuyer,
      source_query: q,
    };
    const current = seen.get(post.uri);
    if (!current || item.score > current.score) seen.set(post.uri, item);
  }
}

const candidates = [...seen.values()]
  .sort((a,b) => b.score - a.score || Date.parse(b.indexed_at || 0) - Date.parse(a.indexed_at || 0))
  .slice(0, 12);

const evidence = {
  version: 3,
  observed_at: new Date().toISOString(),
  platform: 'bluesky',
  asset_id: 'ai_agent_bottleneck',
  route_id: 'vpj_owned_ai_agent_bottleneck_v2',
  query_count: queries.length,
  candidate_count: candidates.length,
  candidates,
  rule: 'Pain-first discovery only. Seller-like posts are excluded. Candidate is not Buyer Reaction until engagement or downstream action is observed.',
};

fs.writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
