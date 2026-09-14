import fs from 'node:fs';

const probePath = new URL('../distribution/revenue-pump-qualified-traffic.json', import.meta.url);
const outPath = new URL('../distribution/revenue-pump-reaction-last-run.json', import.meta.url);

const probe = JSON.parse(fs.readFileSync(probePath, 'utf8'));
const uri = probe.external_post_id;
if (!uri || !String(uri).startsWith('at://')) {
  throw new Error('published_bluesky_post_uri_missing');
}

const endpoint = new URL('https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread');
endpoint.searchParams.set('uri', uri);
endpoint.searchParams.set('depth', '1');
endpoint.searchParams.set('parentHeight', '0');

const response = await fetch(endpoint, {
  headers: { 'user-agent': 'VectorPraxis-RevenuePump/1.0' },
});
if (!response.ok) throw new Error(`bluesky_public_api_http_${response.status}`);

const payload = await response.json();
const post = payload?.thread?.post;
if (!post) throw new Error('bluesky_post_missing_from_thread_response');

const evidence = {
  version: 1,
  observed_at: new Date().toISOString(),
  asset_id: probe.asset_id,
  route_id: probe.route_id,
  probe_id: probe.id,
  external_post_id: uri,
  external_post_url: probe.external_post_url ?? null,
  published_at: probe.published_at ?? null,
  reaction: {
    like_count: Number(post.likeCount ?? 0),
    reply_count: Number(post.replyCount ?? 0),
    repost_count: Number(post.repostCount ?? 0),
    quote_count: Number(post.quoteCount ?? 0),
  },
  buyer_reaction_state: 'UNQUALIFIED_UNTIL_IDENTITY_OR_DOWNSTREAM_ACTION',
  evidence_rules: {
    social_reaction_is_not_buyer_action: true,
    click_is_not_checkout: true,
    checkout_is_not_payment: true,
  },
};

fs.writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
