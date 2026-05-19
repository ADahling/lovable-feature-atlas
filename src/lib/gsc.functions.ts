import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE = "https://lovable-feature-atlas.lovable.app/";
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
    detail?: string;
  };
}

async function gsc(path: string): Promise<{ ok: boolean; status: number; data: any; text: string }> {
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

export const getGscStatus = createServerFn({ method: "GET" }).handler(async (): Promise<GscStatus> => {
  const checkedAt = new Date().toISOString();

  const [verifyRes, siteRes, sitemapRes] = await Promise.all([
    gsc(`/siteVerification/v1/webResource/${SITE_ENC}`),
    gsc(`/webmasters/v3/sites/${SITE_ENC}`),
    gsc(`/webmasters/v3/sites/${SITE_ENC}/sitemaps/${SITEMAP_ENC}`),
  ]);

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
      detail: sitemapRes.ok ? undefined : `HTTP ${sitemapRes.status}`,
    },
  };
});
