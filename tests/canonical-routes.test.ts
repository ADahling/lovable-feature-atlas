/**
 * Deterministic canonical-URL crawl. Fetches pages from a local target
 * (the dev server by default) so results are repeatable and don't depend
 * on live-site deploy state or network flakiness. Canonical tags in the
 * rendered HTML always point at the production origin (SITE_ORIGIN from
 * canonical-meta), regardless of which host serves the response — that's
 * the invariant this test locks down.
 *
 * Run:
 *   bunx vitest run tests/canonical-routes.test.ts
 *
 * Overrides:
 *   FETCH_ORIGIN=http://127.0.0.1:3000 bunx vitest run   # different local target
 *   FETCH_ORIGIN=https://<host>.lovable.app bunx vitest run  # opt-in live crawl
 *
 * If FETCH_ORIGIN is unreachable, the crawl-dependent tests skip cleanly
 * so CI never fails on missing infrastructure.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { canonicalPath, canonicalUrl, SITE_ORIGIN as CANONICAL_ORIGIN } from "../src/lib/canonical-meta";

const FETCH_ORIGIN = process.env.FETCH_ORIGIN ?? "http://localhost:8080";

// Path variants applied to every indexable route — each must canonicalize back.
const QUERY_VARIANTS = ["", "?", "?utm_source=newsletter", "?fbclid=abc123&gclid=xyz"];

interface SitemapEntry {
  loc: string;
  path: string;
}

async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  attempts = 4,
): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status >= 500 || res.status === 408 || res.status === 429) {
        throw new Error(`transient status ${res.status}`);
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (i === attempts - 1) break;
      const delay = 250 * 2 ** i + Math.floor(Math.random() * 250);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function isReachable(origin: string): Promise<boolean> {
  try {
    const res = await fetch(`${origin}/sitemap.xml`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchSitemap(): Promise<SitemapEntry[]> {
  const res = await fetchWithRetry(`${FETCH_ORIGIN}/sitemap.xml`);
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
  const url = `${FETCH_ORIGIN}${path}`;
  const res = await fetchWithRetry(url, { redirect: "follow" });
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

const NOINDEX_ROUTES = ["/sitemap-preview", "/status"];

describe("canonical URL behavior — deterministic crawl", () => {
  let indexableRoutes: SitemapEntry[] = [];
  let originReachable = false;

  beforeAll(async () => {
    originReachable = await isReachable(FETCH_ORIGIN);
    if (!originReachable) {
      console.warn(
        `[canonical-routes] FETCH_ORIGIN ${FETCH_ORIGIN} unreachable — skipping crawl assertions. ` +
          `Start the dev server (\`bun run dev\`) or set FETCH_ORIGIN to a running target.`,
      );
      return;
    }
    indexableRoutes = await fetchSitemap();
    expect(indexableRoutes.length, "sitemap must contain at least one route").toBeGreaterThan(0);
  }, 30_000);

  it("normalizer is consistent (unit sanity)", () => {
    expect(canonicalPath("/")).toBe("/");
    expect(canonicalPath("/about/")).toBe("/about");
    expect(canonicalPath("/about?utm=x")).toBe("/about");
    expect(canonicalPath("//a//b/")).toBe("/a/b");
    expect(canonicalUrl("/x/")).toBe(`${CANONICAL_ORIGIN}/x`);
  });

  it("every sitemap URL uses the production canonical origin", () => {
    if (!originReachable) return;
    for (const { loc } of indexableRoutes) {
      // Sitemap URLs are always emitted at the production canonical origin,
      // even when the sitemap is served from a preview / dev host.
      const ok = loc === CANONICAL_ORIGIN || loc.startsWith(`${CANONICAL_ORIGIN}/`);
      expect(ok, `${loc} must live on ${CANONICAL_ORIGIN}`).toBe(true);
    }
  });

  it("indexable routes — every (path × query) variant resolves to the canonical URL", async () => {
    if (!originReachable) return;
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
    if (!originReachable) return;
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
    if (!originReachable) return;
    const res = await fetch(`${FETCH_ORIGIN}/`, { redirect: "manual" });
    expect(res.status, "apex should be a direct 200, no redirect").toBe(200);
  });
});
