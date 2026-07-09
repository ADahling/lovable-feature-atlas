import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE = "https://atlas.dahlingdigital.com/";
const SITE_ENC = encodeURIComponent(SITE);
const SITEMAP_URL = `${SITE}sitemap.xml`;
const SITEMAP_ENC = encodeURIComponent(SITEMAP_URL);

export interface GscStatus {
  checkedAt: string;
  verification: {
    ok: boolean;
    detail?: string;
  };
  site: {
    ok: boolean;
    permissionLevel?: string;
    detail?: string;
  };
  sitemap: {
    ok: boolean;
    lastSubmitted?: string;
    lastDownloaded?: string;
    isPending?: boolean;
    warnings?: number;
    errors?: number;
    /** URLs submitted in the sitemap (sum across content blocks). */
    submittedUrls?: number;
    /** URLs Google has indexed from this sitemap. */
    indexedUrls?: number;
    detail?: string;
  };
}

async function gsc(
  path: string,
): Promise<{ ok: boolean; status: number; data: any; text: string }> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const gscKey = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
  if (!lovableKey || !gscKey) {
    return { ok: false, status: 0, data: null, text: "Missing connector credentials" };
  }
  const res = await fetch(`${GATEWAY}${path}`, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gscKey,
    },
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { ok: res.ok, status: res.status, data, text };
}

// Module-scope cache to prevent anonymous traffic from burning the GSC OAuth
// quota on the linked Google account. The data updates at most ~once/day
// (sitemap is fetched by Google daily), so caching for 5 minutes is safe.
let cached: { at: number; value: GscStatus } | null = null;
const CACHE_TTL_MS = 5 * 60_000;

async function computeStatus(): Promise<GscStatus> {
  const checkedAt = new Date().toISOString();

  const [verifyRes, siteRes, sitemapRes] = await Promise.all([
    gsc(`/siteVerification/v1/webResource/${SITE_ENC}`),
    gsc(`/webmasters/v3/sites/${SITE_ENC}`),
    gsc(`/webmasters/v3/sites/${SITE_ENC}/sitemaps/${SITEMAP_ENC}`),
  ]);

  const contents: Array<{ submitted?: string; indexed?: string }> = Array.isArray(
    sitemapRes.data?.contents,
  )
    ? sitemapRes.data.contents
    : [];
  const submittedUrls = contents.reduce(
    (sum, c) => sum + (c.submitted ? Number(c.submitted) || 0 : 0),
    0,
  );
  const indexedUrls = contents.reduce(
    (sum, c) => sum + (c.indexed ? Number(c.indexed) || 0 : 0),
    0,
  );

  return {
    checkedAt,
    verification: {
      ok: verifyRes.ok,
      detail: verifyRes.ok ? undefined : `HTTP ${verifyRes.status}`,
    },
    site: {
      ok: siteRes.ok,
      permissionLevel: siteRes.data?.permissionLevel,
      detail: siteRes.ok ? undefined : `HTTP ${siteRes.status}`,
    },
    sitemap: {
      ok: sitemapRes.ok,
      lastSubmitted: sitemapRes.data?.lastSubmitted,
      lastDownloaded: sitemapRes.data?.lastDownloaded,
      isPending: sitemapRes.data?.isPending,
      warnings: sitemapRes.data?.warnings ? Number(sitemapRes.data.warnings) : 0,
      errors: sitemapRes.data?.errors ? Number(sitemapRes.data.errors) : 0,
      submittedUrls,
      indexedUrls,
      detail: sitemapRes.ok ? undefined : `HTTP ${sitemapRes.status}`,
    },
  };
}

export const getGscStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<GscStatus> => {
    const now = Date.now();
    if (cached && now - cached.at < CACHE_TTL_MS) {
      return cached.value;
    }
    const value = await computeStatus();
    cached = { at: now, value };
    return value;
  },
);
