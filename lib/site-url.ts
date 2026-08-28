const FALLBACK_SITE_ORIGIN =
  "https://vector-praxis-japan.user-ex26.chatgpt.site";

function normalizeSiteOrigin(value: string | undefined): string {
  if (!value) return FALLBACK_SITE_ORIGIN;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return FALLBACK_SITE_ORIGIN;
    return url.origin;
  } catch {
    return FALLBACK_SITE_ORIGIN;
  }
}

export const siteOrigin = normalizeSiteOrigin(process.env.SITE_ORIGIN);
export const canonicalUrl = `${siteOrigin}/`;
