import fs from 'node:fs';

const requestPath = new URL('../distribution/bluesky-buyer-match-request.json', import.meta.url);
const outputPath = new URL('../distribution/bluesky-buyer-match-latest.json', import.meta.url);
const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));

if (request.status !== 'READY') {
  console.log(JSON.stringify({status: 'NO_READY_REQUEST'}, null, 2));
  process.exit(0);
}

const endpoint = 'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts';
const queries = request.queries || [
  'Claude Code',
  'AIエージェント',
  'ChatGPT Claude',
  'GitHub 自動化',
  '生成AI 自動化'
];

const scoreTerms = [
  ['引き継ぎ', 6], ['受け渡し', 6], ['詰まり', 5], ['詰まる', 5], ['手作業', 5], ['コピペ', 5],
  ['権限', 5], ['承認', 4], ['待ち', 4], ['待つ', 4], ['貼り', 4], ['連携', 4], ['切り替え', 4],
  ['面倒', 3], ['遅い', 3], ['遅く', 3], ['止まる', 3], ['失敗', 3], ['うまくいか', 3],
  ['Claude Code', 4], ['Claude', 3], ['ChatGPT', 3], ['GitHub', 3], ['Codex', 3], ['Gemini', 2],
  ['AIエージェント', 4], ['AI agent', 3], ['自動化', 3]
];

const hasJapanese = (text) => /[ぁ-んァ-ヶ一-龠]/.test(text || '');
const toPostUrl = (post) => {
  const rkey = String(post.uri || '').split('/').pop();
  return post.author?.handle && rkey ? `https://bsky.app/profile/${post.author.handle}/post/${rkey}` : null;
};

const candidates = new Map();
for (const q of queries) {
  const url = new URL(endpoint);
  url.searchParams.set('q', q);
  url.searchParams.set('sort', 'latest');
  url.searchParams.set('limit', String(request.limit_per_query || 25));
  url.searchParams.set('lang', 'ja');
  const response = await fetch(url, {headers: {'user-agent': 'VectorPraxis-RevenueBuyerMatch/1.0'}});
  if (!response.ok) {
    console.error(`search failed ${response.status} for ${q}`);
    continue;
  }
  const data = await response.json();
  for (const post of data.posts || []) {
    const text = post.record?.text || '';
    if (!hasJapanese(text)) continue;
    if (post.author?.handle === 'vectorpx.bsky.social') continue;
    let score = 0;
    const hits = [];
    for (const [term, weight] of scoreTerms) {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        score += weight;
        hits.push(term);
      }
    }
    if (score < (request.min_score || 7)) continue;
    const existing = candidates.get(post.uri);
    const item = {
      score,
      matched_terms: hits,
      query_match: q,
      indexed_at: post.indexedAt || null,
      author: {
        handle: post.author?.handle || null,
        display_name: post.author?.displayName || null,
        did: post.author?.did || null
      },
      text,
      post_url: toPostUrl(post),
      like_count: post.likeCount ?? null,
      reply_count: post.replyCount ?? null,
      repost_count: post.repostCount ?? null,
      quote_count: post.quoteCount ?? null,
      action_policy: 'REVIEW_ONLY_NO_AUTO_REPLY'
    };
    if (!existing || item.score > existing.score) candidates.set(post.uri, item);
  }
}

const ranked = [...candidates.values()]
  .sort((a, b) => b.score - a.score || String(b.indexed_at).localeCompare(String(a.indexed_at)))
  .slice(0, request.max_results || 15);

const output = {
  observed_at: new Date().toISOString(),
  scope: 'vector_praxis_japan',
  purpose: 'Existing Distribution -> Buyer Match -> Revenue',
  language_gate: 'ja',
  auto_reply: false,
  queries,
  candidate_count: ranked.length,
  candidates: ranked
};
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
