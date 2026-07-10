/**
 * Guards /sitemap.xml against re-listing non-indexable URLs: the noindexed
 * admin/digest surface, the two transactional double-opt-in pages, the two
 * llms.txt feeds, and the sitemap-features.xml companion sitemap.
 *
 * Run: `bunx vitest run tests/sitemap-forbidden-paths.test.ts`
 */

import { describe, it, expect, beforeAll } from "vitest";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";

const FORBIDDEN_PATHS = [
  "/admin/digest",
  "/digest/confirm",
  "/digest/unsubscribe",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap-features.xml",
] as const;

let locs: string[] = [];

beforeAll(async () => {
  const res = await fetch(`${SITE_ORIGIN}/sitemap.xml`);
  expect(res.status).toBe(200);
  const xml = await res.text();
  locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
  expect(locs.length).toBeGreaterThan(0);
});

describe("/sitemap.xml forbidden paths", () => {
  for (const path of FORBIDDEN_PATHS) {
    it(`never lists ${path}`, () => {
      const matches = locs.filter((loc) => {
        const u = new URL(loc);
        return u.pathname === path;
      });
      expect(matches).toEqual([]);
    });
  }
});
