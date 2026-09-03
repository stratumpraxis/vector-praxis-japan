import fs from 'node:fs';

const outPath = new URL('../distribution/social-provider-preflight.json', import.meta.url);
const now = new Date().toISOString();
const result = {
  observed_at: now,
  secrets_present: {
    fedica: Boolean(process.env.FEDICA_API_TOKEN),
    metricool_token: Boolean(process.env.METRICOOL_API_TOKEN),
    metricool_user_id: Boolean(process.env.METRICOOL_USER_ID),
    metricool_blog_id: Boolean(process.env.METRICOOL_BLOG_ID),
    publer: Boolean(process.env.PUBLER_API_KEY),
    legacy_webhook: Boolean(process.env.SOCIAL_PUBLISH_WEBHOOK_URL)
  },
  providers: {}
};

async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text.slice(0, 500) }; }
}

if (process.env.FEDICA_API_TOKEN) {
  try {
    const res = await fetch('https://fedica.com/api/publish/accounts', {
      headers: { Authorization: `Bearer ${process.env.FEDICA_API_TOKEN}` }
    });
    const body = await safeJson(res);
    result.providers.fedica = {
      http_status: res.status,
      ok: res.ok,
      accounts: Array.isArray(body?.Accounts) ? body.Accounts.map((a) => ({
        platform: a.Platform || null,
        account_id: a.AccountId || null
      })) : []
    };
  } catch (error) {
    result.providers.fedica = { ok: false, error: error?.message || 'unknown' };
  }
}

if (process.env.PUBLER_API_KEY) {
  try {
    const auth = { Authorization: `Bearer-API ${process.env.PUBLER_API_KEY}` };
    const wr = await fetch('https://app.publer.com/api/v1/workspaces', { headers: auth });
    const workspaces = await safeJson(wr);
    const wsList = Array.isArray(workspaces) ? workspaces : (workspaces?.workspaces || workspaces?.data || []);
    result.providers.publer = { http_status: wr.status, ok: wr.ok, workspaces: [] };
    if (wr.ok) {
      for (const ws of wsList.slice(0, 10)) {
        const ar = await fetch('https://app.publer.com/api/v1/accounts', {
          headers: { ...auth, 'Publer-Workspace-Id': String(ws.id) }
        });
        const accountsBody = await safeJson(ar);
        const accounts = Array.isArray(accountsBody) ? accountsBody : (accountsBody?.accounts || accountsBody?.data || []);
        result.providers.publer.workspaces.push({
          id: ws.id || null,
          name: ws.name || null,
          plan: ws.plan || null,
          accounts_http_status: ar.status,
          accounts: Array.isArray(accounts) ? accounts.map((a) => ({
            id: a.id || null,
            provider: a.provider || null,
            name: a.name || null,
            social_id: a.social_id || null,
            type: a.type || null
          })) : []
        });
      }
    }
  } catch (error) {
    result.providers.publer = { ok: false, error: error?.message || 'unknown' };
  }
}

// Metricool's scheduler API needs token + userId + blogId. This preflight never prints the values.
if (process.env.METRICOOL_API_TOKEN) {
  result.providers.metricool = {
    credentials_complete: Boolean(process.env.METRICOOL_USER_ID && process.env.METRICOOL_BLOG_ID),
    note: 'Credential presence only; no write attempted during preflight.'
  };
}

fs.writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
