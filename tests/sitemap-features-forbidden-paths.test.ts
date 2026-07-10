/**
 * Guards /sitemap-features.xml against listing anything other than
 * /features/{slug} entries. Explicitly asserts none of the noindexed
 * admin/digest surface, the double-opt-in transactional pages, or the
 * llms.txt feeds sneak back in.
 *
 * Run: `bunx vitest run tests/sitemap-features-forbidden-paths.test.ts`
 */

import { describe, it, expect, beforeAll } from "vitest";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";

const FORBIDDEN_PATHS = [
  "/admin/digest",
  "/digest",
  "/digest/confirm",
  "/digest/unsubscribe",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
  "/sitemap-features.xml",
] as const;

let locs: string[] = [];

beforeAll(async () => {
  const res = await fetch(`${SITE_ORIGIN}/sitemap-features.xml`);
  expect(res.status).toBe(200);
  const xml = await res.text();
  locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
  expect(locs.length).toBeGreaterThan(0);
});

describe("/sitemap-features.xml contents", () => {
  for (const path of FORBIDDEN_PATHS) {
    it(`never lists ${path}`, () => {
      const matches = locs.filter((loc) => new URL(loc).pathname === path);
      expect(matches).toEqual([]);
    });
  }

  it("only lists /features/{slug} entries", () => {
    const offenders = locs.filter((loc) => {
      const p = new URL(loc).pathname;
      return !/^\/features\/[^/]+$/.test(p);
    });
    expect(offenders).toEqual([]);
  });
});
