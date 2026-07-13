/**
 * Live-site crawl test: every internal route resolves to the canonical apex
 * URL with no unexpected redirects, and the page's canonical / og:url /
 * twitter:url tags all match.
 *
 * Discovery: pulls /sitemap.xml from the live site so this stays in sync as
 * routes are added/removed. Also tests known noindex routes explicitly to
 * confirm they intentionally OMIT canonical tags.
 *
 * Run: `bunx vitest run tests/canonical-routes.test.ts`
 * Override target host: `SITE_ORIGIN=https://<other>.lovable.app bunx vitest run`
 */

import { describe, it, expect, beforeAll } from "vitest";
import { canonicalPath, canonicalUrl, SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;

// Path variants applied to every indexable route — each must canonicalize back.
const QUERY_VARIANTS = ["", "?", "?utm_source=newsletter", "?fbclid=abc123&gclid=xyz"];

interface SitemapEntry {
  loc: string;
  path: string;
}

async function fetchSitemap(): Promise<SitemapEntry[]> {
  const res = await fetch(`${SITE_ORIGIN}/sitemap.xml`);
  expect(res.status, "sitemap.xml must be reachable").toBe(200);
  const xml = await res.text();
  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
  return locs.map((loc) => ({ loc, path: new URL(loc).pathname }));
}

function extractTag(html: string, pattern: RegExp): string | null {
  const m = html.match(pattern);
  return m ? m[1] : null;
}

interface PageMeta {
  canonical: string | null;
  ogUrl: string | null;
  twitterUrl: string | null;
  robots: string | null;
  finalUrl: string;
  status: number;
  redirected: boolean;
}

async function inspectPage(path: string): Promise<PageMeta> {
  const url = `${SITE_ORIGIN}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  return {
    finalUrl: res.url,
    status: res.status,
    redirected: res.redirected,
    canonical: extractTag(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i),
    ogUrl: extractTag(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i),
    twitterUrl: extractTag(html, /<meta[^>]+name=["']twitter:url["'][^>]+content=["']([^"']+)["']/i),
    robots: extractTag(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i),
  };
}

// Routes that intentionally render `robots=noindex` and must NOT emit
// canonical/og:url/twitter:url tags. Keep in sync with route files that
// call buildCanonicalTags({ noindex: true }).
const NOINDEX_ROUTES = ["/sitemap-preview"];

describe("canonical URL behavior — live site crawl", () => {
  let indexableRoutes: SitemapEntry[] = [];

  beforeAll(async () => {
    indexableRoutes = await fetchSitemap();
    expect(indexableRoutes.length, "sitemap must contain at least one route").toBeGreaterThan(0);
  }, 30_000);

  it("normalizer is consistent (unit sanity)", () => {
    expect(canonicalPath("/")).toBe("/");
    expect(canonicalPath("/about/")).toBe("/about");
    expect(canonicalPath("/about?utm=x")).toBe("/about");
    expect(canonicalPath("//a//b/")).toBe("/a/b");
    expect(canonicalUrl("/x/")).toBe(`${SITE_ORIGIN}/x`);
  });

  it("every sitemap URL uses the canonical origin", () => {
    for (const { loc } of indexableRoutes) {
      // Apex is allowed to appear as SITE_ORIGIN with no trailing slash
      // (matches canonicalUrl("/") — intentional across the codebase).
      const ok = loc === SITE_ORIGIN || loc.startsWith(`${SITE_ORIGIN}/`);
      expect(ok, `${loc} must live on ${SITE_ORIGIN}`).toBe(true);
    }
  });

  it("indexable routes — every (path × query) variant resolves to the canonical URL", async () => {
    // Build the full variant list up front, then fetch with bounded concurrency.
    // Serial fetches don't scale past ~100 routes; the sitemap now carries 380+.
    const jobs: Array<{ path: string; variant: string; expectedCanonical: string }> = [];
    for (const { path } of indexableRoutes) {
      const expectedCanonical = canonicalUrl(path);
      const variants = [path, ...QUERY_VARIANTS.map((q) => `${path}${q}`)];
      if (path !== "/") variants.push(`${path}/`);
      for (const variant of variants) jobs.push({ path, variant, expectedCanonical });
    }

    const CONCURRENCY = 16;
    let cursor = 0;
    const failures: string[] = [];

    async function worker() {
      while (cursor < jobs.length) {
        const job = jobs[cursor++];
        try {
          const meta = await inspectPage(job.variant);
          if (meta.status !== 200) throw new Error(`status ${meta.status}`);
          const finalPath = new URL(meta.finalUrl).pathname;
          if (canonicalPath(finalPath) !== canonicalPath(job.path)) {
            throw new Error(`landed on ${finalPath}, expected ${canonicalPath(job.path)}`);
          }
          if (meta.canonical !== job.expectedCanonical) throw new Error(`canonical=${meta.canonical}`);
          if (meta.ogUrl !== job.expectedCanonical) throw new Error(`og:url=${meta.ogUrl}`);
          if (meta.twitterUrl !== job.expectedCanonical) throw new Error(`twitter:url=${meta.twitterUrl}`);
          if (/noindex/i.test(meta.robots ?? "")) throw new Error(`indexable route is noindex`);
        } catch (err) {
          failures.push(`${job.variant} → ${(err as Error).message}`);
        }
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    expect(failures, `canonical failures:\n${failures.slice(0, 20).join("\n")}`).toEqual([]);
  }, 600_000);


  it("noindex routes — emit noindex and OMIT canonical/og:url/twitter:url", async () => {
    for (const path of NOINDEX_ROUTES) {
      const meta = await inspectPage(path);
      expect(meta.status).toBe(200);
      expect(meta.robots ?? "", `${path}: must declare noindex`).toMatch(/noindex/i);
      expect(meta.canonical, `${path}: must NOT emit canonical`).toBeNull();
      expect(meta.ogUrl, `${path}: must NOT emit og:url`).toBeNull();
      expect(meta.twitterUrl, `${path}: must NOT emit twitter:url`).toBeNull();
    }
  }, 60_000);

  it("apex returns 200 with no redirect hop", async () => {
    const res = await fetch(`${SITE_ORIGIN}/`, { redirect: "manual" });
    expect(res.status, "apex should be a direct 200, no redirect").toBe(200);
  });
});
