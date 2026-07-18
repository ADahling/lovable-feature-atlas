import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { SITE_ORIGIN, canonicalUrl } from "@/lib/canonical-meta";

/**
 * Routes the audit checks. Keep in sync with src/routeTree.gen.ts public
 * indexable paths (exclude /sitemap.xml, /api/*, and anything noindex).
 */
const AUDIT_PATHS: readonly string[] = ["/", "/sitemap-preview"];

interface RouteAuditResult {
  path: string;
  fetched_url: string;
  expected: string;
  http_status: number;
  canonical: string | null;
  og_url: string | null;
  twitter_url: string | null;
  in_sitemap: boolean;
  mismatches: string[];
  error: string | null;
}

export interface SeoAuditReport {
  ran_at: string;
  site_origin: string;
  base_used: string;
  sitemap_urls: string[];
  sitemap_error: string | null;
  routes: RouteAuditResult[];
  summary: { total: number; ok: number; with_mismatches: number };
}

function extractAttr(html: string, regex: RegExp): string | null {
  const m = html.match(regex);
  return m?.[1]?.trim() ?? null;
}

function parseTags(html: string) {
  return {
    canonical: extractAttr(
      html,
      /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
    ),
    og_url: extractAttr(
      html,
      /<meta[^>]+property=["']og:url["'][^>]*content=["']([^"']+)["']/i,
    ),
    twitter_url: extractAttr(
      html,
      /<meta[^>]+name=["']twitter:url["'][^>]*content=["']([^"']+)["']/i,
    ),
  };
}

function parseSitemap(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

export const auditRoutesSeo = createServerFn({ method: "POST" }).handler(
  async (): Promise<SeoAuditReport> => {
    // Always fetch from the fixed public origin — never trust the request's
    // Host header, which would let an unauthenticated caller turn this audit
    // tool into a blind SSRF probe against arbitrary hosts.
    const base = SITE_ORIGIN;

    // 1) Load sitemap
    let sitemap_urls: string[] = [];
    let sitemap_error: string | null = null;
    try {
      const res = await fetch(`${base}/sitemap.xml`, {
        headers: { "User-Agent": "AtlasSeoAudit/1.0" },
      });
      if (!res.ok) {
        sitemap_error = `sitemap fetch ${res.status}`;
      } else {
        sitemap_urls = parseSitemap(await res.text());
      }
    } catch (e) {
      sitemap_error = e instanceof Error ? e.message : "sitemap fetch failed";
    }
    const sitemapSet = new Set(sitemap_urls.map((u) => u.replace(/\/+$/, "")));

    // 2) Audit each route
    const routes: RouteAuditResult[] = [];
    for (const path of AUDIT_PATHS) {
      const expected = canonicalUrl(path);
      const expectedKey = expected.replace(/\/+$/, "");
      const fetched_url = `${base}${path}`;
      const result: RouteAuditResult = {
        path,
        fetched_url,
        expected,
        http_status: 0,
        canonical: null,
        og_url: null,
        twitter_url: null,
        in_sitemap: sitemapSet.has(expectedKey) || sitemapSet.has(expected),
        mismatches: [],
        error: null,
      };
      try {
        const res = await fetch(fetched_url, {
          headers: { "User-Agent": "AtlasSeoAudit/1.0" },
          redirect: "manual",
        });
        result.http_status = res.status;
        if (res.status >= 300 && res.status < 400) {
          result.error = `redirect ${res.status} → ${res.headers.get("location") ?? "?"}`;
        } else if (!res.ok) {
          result.error = `http ${res.status}`;
        } else {
          const html = await res.text();
          const tags = parseTags(html);
          result.canonical = tags.canonical;
          result.og_url = tags.og_url;
          result.twitter_url = tags.twitter_url;

          const checkTag = (label: string, value: string | null) => {
            if (value === null) {
              result.mismatches.push(`${label} missing`);
            } else if (value.replace(/\/+$/, "") !== expectedKey) {
              result.mismatches.push(`${label}=${value} (expected ${expected})`);
            }
          };
          checkTag("canonical", result.canonical);
          checkTag("og:url", result.og_url);
          checkTag("twitter:url", result.twitter_url);
          if (!result.in_sitemap) {
            result.mismatches.push(`not in sitemap.xml`);
          }
        }
      } catch (e) {
        result.error = e instanceof Error ? e.message : "fetch failed";
      }
      routes.push(result);
    }

    const with_mismatches = routes.filter(
      (r) => r.mismatches.length > 0 || r.error,
    ).length;
    return {
      ran_at: new Date().toISOString(),
      site_origin: SITE_ORIGIN,
      base_used: base,
      sitemap_urls,
      sitemap_error,
      routes,
      summary: {
        total: routes.length,
        ok: routes.length - with_mismatches,
        with_mismatches,
      },
    };
  },
);
