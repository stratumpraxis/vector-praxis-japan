const DEFAULT_PDS = 'https://bsky.social';
const VIDEO_SERVICE = 'https://video.bsky.app';
const MAX_VIDEO_BYTES = 300_000_000;
const MAX_POST_GRAPHEMES = 300;

function pdsUrl() {
  return (process.env.BLUESKY_PDS_URL || DEFAULT_PDS).replace(/\/$/, '');
}

export function blueskyConfigured() {
  return Boolean(process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD);
}

async function readJson(response) {
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text.slice(0, 500) }; }
  if (!response.ok) {
    const detail = body?.message || body?.error || body?.raw || `HTTP ${response.status}`;
    throw new Error(`bluesky_http_${response.status}:${String(detail).slice(0, 300)}`);
  }
  return body;
}

async function createSession() {
  const response = await fetch(`${pdsUrl()}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      identifier: process.env.BLUESKY_HANDLE,
      password: process.env.BLUESKY_APP_PASSWORD
    })
  });
  const session = await readJson(response);
  if (!session?.accessJwt || !session?.did || !session?.handle) {
    throw new Error('bluesky_session_missing_required_fields');
  }
  return session;
}

async function serviceAuth(accessJwt, aud, lxm) {
  const url = new URL(`${pdsUrl()}/xrpc/com.atproto.server.getServiceAuth`);
  url.searchParams.set('aud', aud);
  url.searchParams.set('lxm', lxm);
  url.searchParams.set('exp', String(Math.floor(Date.now() / 1000) + 30 * 60));
  const response = await fetch(url, {
    headers: {Authorization: `Bearer ${accessJwt}`}
  });
  const payload = await readJson(response);
  if (!payload?.token) throw new Error('bluesky_service_auth_missing_token');
  return payload.token;
}

function countGraphemes(text) {
  if (globalThis.Intl?.Segmenter) {
    return [...new Intl.Segmenter('ja', {granularity: 'grapheme'}).segment(text)].length;
  }
  return Array.from(text).length;
}

function linkFacet(text, url) {
  const charStart = text.indexOf(url);
  if (charStart < 0) return [];
  const byteStart = Buffer.byteLength(text.slice(0, charStart), 'utf8');
  const byteEnd = byteStart + Buffer.byteLength(url, 'utf8');
  return [{
    index: {byteStart, byteEnd},
    features: [{
      '$type': 'app.bsky.richtext.facet#link',
      uri: url
    }]
  }];
}

function filenameFromUrl(mediaUrl) {
  try {
    const pathname = new URL(mediaUrl).pathname;
    return pathname.split('/').filter(Boolean).pop() || 'video.mp4';
  } catch {
    return 'video.mp4';
  }
}

async function downloadVideo(mediaUrl) {
  const response = await fetch(mediaUrl);
  if (!response.ok) throw new Error(`bluesky_media_download_http_${response.status}`);
  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim();
  if (contentType && contentType !== 'video/mp4' && contentType !== 'application/octet-stream') {
    throw new Error(`bluesky_media_unexpected_content_type:${contentType}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error('bluesky_media_empty');
  if (bytes.length > MAX_VIDEO_BYTES) throw new Error(`bluesky_media_too_large:${bytes.length}`);
  return bytes;
}

async function pollVideoJob(jobId, accessJwt) {
  const deadline = Date.now() + 4 * 60 * 1000;
  let directAuthToken = null;

  while (Date.now() < deadline) {
    const url = new URL(`${VIDEO_SERVICE}/xrpc/app.bsky.video.getJobStatus`);
    url.searchParams.set('jobId', jobId);
    let response = await fetch(url, directAuthToken ? {headers: {Authorization: `Bearer ${directAuthToken}`}} : undefined);

    if (response.status === 401 && !directAuthToken) {
      directAuthToken = await serviceAuth(accessJwt, 'did:web:video.bsky.app', 'app.bsky.video.getJobStatus');
      response = await fetch(url, {headers: {Authorization: `Bearer ${directAuthToken}`}});
    }

    const payload = await readJson(response);
    const status = payload?.jobStatus || payload;
    if (status?.blob) return status.blob;
    if (status?.state === 'JOB_STATE_FAILED') {
      throw new Error(`bluesky_video_failed:${status?.failureCode || status?.error || status?.message || 'unknown'}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('bluesky_video_processing_timeout');
}

async function uploadVideo(mediaUrl, session) {
  const bytes = await downloadVideo(mediaUrl);
  const pdsHost = new URL(pdsUrl()).host;
  const uploadToken = await serviceAuth(
    session.accessJwt,
    `did:web:${pdsHost}`,
    'com.atproto.repo.uploadBlob'
  );

  const uploadUrl = new URL(`${VIDEO_SERVICE}/xrpc/app.bsky.video.uploadVideo`);
  uploadUrl.searchParams.set('did', session.did);
  uploadUrl.searchParams.set('name', filenameFromUrl(mediaUrl));

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${uploadToken}`,
      'content-type': 'video/mp4',
      'content-length': String(bytes.length)
    },
    body: bytes
  });
  const payload = await readJson(response);
  const status = payload?.jobStatus || payload;
  if (status?.blob) return status.blob;
  if (!status?.jobId) throw new Error('bluesky_video_missing_job_id');
  return pollVideoJob(status.jobId, session.accessJwt);
}

export async function publishBluesky({item, text, trackedUrl}) {
  if (!blueskyConfigured()) throw new Error('bluesky_not_configured');
  if (countGraphemes(text) > MAX_POST_GRAPHEMES) {
    throw new Error(`bluesky_text_too_long:${countGraphemes(text)}`);
  }
  if (item.require_media && !item.media_url) throw new Error('bluesky_required_media_missing');
  if (item.require_media && item.media_type !== 'video/mp4') {
    throw new Error(`bluesky_unsupported_media_type:${item.media_type || 'missing'}`);
  }

  const session = await createSession();
  const record = {
    '$type': 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
    langs: ['ja'],
    facets: linkFacet(text, trackedUrl)
  };

  if (item.media_url) {
    const blob = await uploadVideo(item.media_url, session);
    record.embed = {
      '$type': 'app.bsky.embed.video',
      video: blob,
      alt: item.alt_text || ''
    };
  }

  const response = await fetch(`${pdsUrl()}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessJwt}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record
    })
  });
  const payload = await readJson(response);
  if (!payload?.uri) throw new Error('bluesky_create_record_missing_uri');
  const rkey = payload.uri.split('/').pop();
  return {
    external_post_id: payload.uri,
    external_post_url: rkey ? `https://bsky.app/profile/${session.handle}/post/${rkey}` : null,
    published_at: new Date().toISOString(),
    publisher: 'bluesky_direct'
  };
}
