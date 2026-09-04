const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || '';
const USER_ID = process.env.INSTAGRAM_USER_ID || '';
const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || 'v25.0';
const GRAPH_BASE = `https://graph.instagram.com/${GRAPH_VERSION}`;

export function instagramConfigured() {
  return Boolean(ACCESS_TOKEN && USER_ID);
}

async function readJson(response) {
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {raw: text.slice(0, 500)};
  }
  if (!response.ok) {
    const message = body?.error?.message || body?.message || body?.error?.type || `http_${response.status}`;
    throw new Error(`instagram_http_${response.status}:${message}`);
  }
  return body;
}

async function postForm(path, params) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) body.set(key, String(value));
  }
  const response = await fetch(`${GRAPH_BASE}${path}`, {
    method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body
  });
  return readJson(response);
}

async function getJson(path, params = {}) {
  const url = new URL(`${GRAPH_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  const response = await fetch(url);
  return readJson(response);
}

async function waitForContainer(containerId) {
  const timeoutMs = Number(process.env.INSTAGRAM_CONTAINER_TIMEOUT_MS || 180000);
  const intervalMs = Number(process.env.INSTAGRAM_CONTAINER_POLL_MS || 8000);
  const deadline = Date.now() + timeoutMs;
  let last = null;

  while (Date.now() < deadline) {
    last = await getJson(`/${encodeURIComponent(containerId)}`, {
      fields: 'status_code,status',
      access_token: ACCESS_TOKEN
    });
    const status = String(last?.status_code || '').toUpperCase();
    if (status === 'FINISHED') return last;
    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(`instagram_container_${status.toLowerCase()}:${last?.status || 'unknown'}`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`instagram_container_timeout:${last?.status_code || 'unknown'}`);
}

export async function preflightInstagram() {
  if (!instagramConfigured()) return {ok: false, configured: false};
  try {
    const body = await getJson('/me', {
      fields: 'user_id,username',
      access_token: ACCESS_TOKEN
    });
    return {
      ok: true,
      configured: true,
      user_id: body?.user_id || body?.id || USER_ID,
      username: body?.username || null,
      graph_version: GRAPH_VERSION
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      error: error?.message || 'unknown',
      graph_version: GRAPH_VERSION
    };
  }
}

export async function publishInstagram({item, text}) {
  if (!instagramConfigured()) throw new Error('instagram_not_configured');
  if (!item?.media_url) throw new Error('instagram_media_url_missing');

  const container = await postForm(`/${encodeURIComponent(USER_ID)}/media`, {
    media_type: 'REELS',
    video_url: item.media_url,
    caption: text,
    share_to_feed: 'true',
    access_token: ACCESS_TOKEN
  });

  if (!container?.id) throw new Error('instagram_container_id_missing');
  await waitForContainer(container.id);

  const published = await postForm(`/${encodeURIComponent(USER_ID)}/media_publish`, {
    creation_id: container.id,
    access_token: ACCESS_TOKEN
  });
  if (!published?.id) throw new Error('instagram_media_id_missing');

  let permalink = null;
  try {
    const media = await getJson(`/${encodeURIComponent(published.id)}`, {
      fields: 'permalink',
      access_token: ACCESS_TOKEN
    });
    permalink = media?.permalink || null;
  } catch {
    // The publish itself is authoritative; permalink lookup failure must not duplicate a post.
  }

  return {
    external_post_id: published.id,
    external_post_url: permalink,
    published_at: new Date().toISOString(),
    publisher: 'instagram_direct'
  };
}
