import fs from 'node:fs';

const probePath = new URL('../distribution/revenue-pump-qualified-traffic.json', import.meta.url);
const outPath = new URL('../distribution/revenue-pump-reaction-last-run.json', import.meta.url);

const probe = JSON.parse(fs.readFileSync(probePath, 'utf8'));
const uri = probe.external_post_id;

if (!uri || !String(uri).startsWith('at://')) {
  throw new Error('published_bluesky_post_uri_missing');
}

const endpoint = new URL('https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts');
endpoint.searchParams.append('uris', uri);

const response = await fetch(endpoint, {
  headers: {'user-agent': 'vector-praxis-revenue-reaction-snapshot/1.0'}
});
if (!response.ok) {
  throw new Error(`bluesky_reaction_http_${response.status}:${(await response.text()).slice(0, 300)}`);
}

const payload = await response.json();
const post = Array.isArray(payload?.posts) ? payload.posts[0] : null;
if (!post) throw new Error('bluesky_reaction_post_not_found');

const snapshot = {
  version: 1,
  observed_at: new Date().toISOString(),
  asset_id: probe.asset_id,
  route_id: probe.route_id,
  platform: 'bluesky',
  external_post_id: uri,
  external_post_url: probe.external_post_url || null,
  published_at: probe.published_at || null,
  reaction: {
    reply_count: Number(post.replyCount || 0),
    repost_count: Number(post.repostCount || 0),
    like_count: Number(post.likeCount || 0),
    quote_count: Number(post.quoteCount || 0)
  },
  evidence_class: 'SOCIAL_ACCOUNT_REACTION',
  revenue_evidence: false,
  note: 'Social reaction is stronger than raw link-scanner traffic, but it is not Buyer Action, Checkout, or Payment evidence.'
};

fs.writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
