import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import {
  SITE_ORIGIN,
  buildCanonicalTags,
  canonicalUrl,
} from "@/lib/canonical-meta";

function authorize(request: Request): Response | null {
  const expected = process.env.REFRESH_TOKEN ?? "";
  if (!expected) return new Response("Server misconfigured", { status: 500 });
  const provided = request.headers.get("apikey") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

/**
 * Every app route, mirrored from src/routes. Page routes that should appear in
 * the sitemap are marked `noindex: false`; everything else is suppressed.
 */
interface RouteSpec {
  path: string;
  kind: "page" | "api";
  noindex: boolean;
}

const APP_ROUTES: readonly RouteSpec[] = [
  { path: "/", kind: "page", noindex: false },
  { path: "/search", kind: "page", noindex: true },
  { path: "/seo-audit", kind: "page", noindex: true },
  { path: "/sitemap-preview", kind: "page", noindex: true },
  { path: "/sitemap.xml", kind: "api", noindex: true },
  { path: "/api/debug/seo", kind: "api", noindex: true },
  { path: "/api/debug/seo-report", kind: "api", noindex: true },
  { path: "/api/public/gsc-sync", kind: "api", noindex: true },
  { path: "/api/public/refresh-features", kind: "api", noindex: true },
] as const;

interface RouteEntry {
  path: string;
  kind: "page" | "api";
  noindex: boolean;
  canonical: string | null;
  og_url: string | null;
  twitter_url: string | null;
  expected_in_sitemap: boolean;
  in_sitemap: boolean;
  status: "ok" | "missing" | "unexpected";
}

interface SeoReport {
  generated_at: string;
  site_origin: string;
  sitemap: {
    url: string;
    error: string | null;
    entries: string[];
  };
  summary: {
    total_routes: number;
    clean: number;
    with_issues: number;
  };
  routes: RouteEntry[];
}

async function fetchSitemapEntries(): Promise<{ entries: string[]; error: string | null }> {
  const url = `${SITE_ORIGIN}/sitemap.xml`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AtlasSeoReport/1.0" },
    });
    if (!res.ok) {
      return { entries: [], error: `HTTP ${res.status}` };
    }
    const body = await res.text();
    const entries = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(
      (m) => m[1],
    );
    return { entries, error: null };
  } catch (err) {
    return {
      entries: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export const Route = createFileRoute("/api/debug/seo-report")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const unauthorized = authorize(request);
        if (unauthorized) return unauthorized;
        const sitemap = await fetchSitemapEntries();
        const sitemapSet = new Set(sitemap.entries);

        const routes: RouteEntry[] = APP_ROUTES.map((r) => {
          const canonical = canonicalUrl(r.path);
          const inSitemap = sitemapSet.has(canonical);
          const expectedInSitemap = r.kind === "page" && !r.noindex;
          const suppress = r.noindex || r.kind === "api";
          const tags = buildCanonicalTags({ path: r.path, noindex: suppress });
          const canonicalTag = tags.links.find((l) => l.rel === "canonical")?.href ?? null;
          const ogUrl =
            tags.meta.find((m) => m.property === "og:url")?.content ?? null;
          const twitterUrl =
            tags.meta.find((m) => m.name === "twitter:url")?.content ?? null;

          let status: RouteEntry["status"] = "ok";
          if (expectedInSitemap && !inSitemap) status = "missing";
          else if (!expectedInSitemap && inSitemap) status = "unexpected";

          return {
            path: r.path,
            kind: r.kind,
            noindex: r.noindex,
            canonical: canonicalTag,
            og_url: ogUrl,
            twitter_url: twitterUrl,
            expected_in_sitemap: expectedInSitemap,
            in_sitemap: inSitemap,
            status,
          };
        });

        const clean = routes.filter((r) => r.status === "ok").length;

        const report: SeoReport = {
          generated_at: new Date().toISOString(),
          site_origin: SITE_ORIGIN,
          sitemap: {
            url: `${SITE_ORIGIN}/sitemap.xml`,
            error: sitemap.error,
            entries: sitemap.entries,
          },
          summary: {
            total_routes: routes.length,
            clean,
            with_issues: routes.length - clean,
          },
          routes,
        };

        return Response.json(report, {
          headers: {
            "Cache-Control": "no-store",
            "Content-Type": "application/json",
          },
        });
      },
    },
  },
});
