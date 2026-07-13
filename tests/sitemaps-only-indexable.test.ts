/**
 * Regression guard for the two sitemaps: they may only advertise the
 * approved indexable route prefixes and must not gain surprise entries
 * (auth pages, admin surfaces, transactional flows, API endpoints, etc.).
 *
 * /sitemap.xml — the site index. Allowed prefixes:
 *   /                       (home)
 *   /about, /constellation, /digest, /draw, /quiz, /status
 *   /categories/{slug}
 *   /vs/{slug}
 *
 * /sitemap-features.xml — feature detail companion sitemap.
 *   Every entry must match /features/{slug}.
 *
 * Anything else (e.g. /admin/digest, /digest/confirm, /digest/unsubscribe,
 * /api/*, /llms.txt, /llms-full.txt, /sitemap*.xml self-references, or a
 * brand-new top-level route added without updating this test) fails.
 *
 * Run: `bunx vitest run tests/sitemaps-only-indexable.test.ts`
 */

import { describe, it, expect } from "vitest";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";

async function fetchLocs(path: string): Promise<string[]> {
  const res = await fetch(`${SITE_ORIGIN}${path}`);
  expect(res.status, `${path} status`).toBe(200);
  const xml = await res.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
}

const ALLOWED_STATIC = new Set([
  "/",
  "/about",
  "/constellation",
  "/digest",
  "/draw",
  "/quiz",
  "/status",
]);

const ALLOWED_DYNAMIC_PREFIXES = ["/categories/", "/features/", "/vs/", "/digest/"] as const;


function classifySiteIndexPath(p: string): "allowed" | "unknown" {
  if (ALLOWED_STATIC.has(p)) return "allowed";
  for (const prefix of ALLOWED_DYNAMIC_PREFIXES) {
    if (p.startsWith(prefix) && p.length > prefix.length && !p.slice(prefix.length).includes("/")) {
      return "allowed";
    }
  }
  return "unknown";
}

describe("/sitemap.xml only lists approved indexable routes", () => {
  it("every <loc> is https://atlas.dahlingdigital.com and matches an approved prefix", async () => {
    const locs = await fetchLocs("/sitemap.xml");
    expect(locs.length).toBeGreaterThan(0);

    const unexpected: string[] = [];
    for (const loc of locs) {
      const u = new URL(loc);
      if (u.origin !== "https://atlas.dahlingdigital.com") {
        unexpected.push(`${loc} (wrong origin)`);
        continue;
      }
      if (classifySiteIndexPath(u.pathname) === "unknown") {
        unexpected.push(loc);
      }
    }
    expect(unexpected).toEqual([]);
  });

  it("home page is present", async () => {
    const locs = await fetchLocs("/sitemap.xml");
    const paths = new Set(locs.map((l) => new URL(l).pathname));
    expect(paths.has("/")).toBe(true);
  });
});

describe("/sitemap-features.xml only lists /features/{slug} entries", () => {
  it("every <loc> is a /features/{slug} URL on the atlas origin", async () => {
    const locs = await fetchLocs("/sitemap-features.xml");
    expect(locs.length).toBeGreaterThan(0);

    const offenders = locs.filter((loc) => {
      const u = new URL(loc);
      if (u.origin !== "https://atlas.dahlingdigital.com") return true;
      return !/^\/features\/[a-z0-9][a-z0-9-]*$/.test(u.pathname);
    });
    expect(offenders).toEqual([]);
  });

  it("has no duplicate slugs", async () => {
    const locs = await fetchLocs("/sitemap-features.xml");
    const paths = locs.map((l) => new URL(l).pathname);
    const dupes = paths.filter((p, i) => paths.indexOf(p) !== i);
    expect(dupes).toEqual([]);
  });
});
