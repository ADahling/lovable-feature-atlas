/**
 * Guards /robots.txt against re-introducing references to noindex-only
 * surfaces or AI-feed files. The double-opt-in pages, admin dashboard,
 * and llms.txt feeds must not appear at all. `sitemap-features.xml` is
 * legitimate only as a top-level `Sitemap:` directive; asserting it never
 * shows up in an `Allow:` / `Disallow:` rule protects against accidental
 * path-blocking that would break crawl of the feature sitemap itself.
 *
 * Run: `bunx vitest run tests/robots-forbidden-references.test.ts`
 */

import { describe, it, expect, beforeAll } from "vitest";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";

// Tokens that must never appear anywhere in robots.txt.
const FORBIDDEN_ANYWHERE = [
  "/admin/digest",
  "/digest/confirm",
  "/digest/unsubscribe",
  "/llms.txt",
  "/llms-full.txt",
  "llms.txt",
  "llms-full.txt",
] as const;

// Tokens that may only appear on a `Sitemap:` directive line.
const SITEMAP_ONLY = ["sitemap-features.xml"] as const;

let raw = "";
let lines: string[] = [];

beforeAll(async () => {
  const res = await fetch(`${SITE_ORIGIN}/robots.txt`);
  expect(res.status).toBe(200);
  raw = await res.text();
  lines = raw.split(/\r?\n/);
});

describe("/robots.txt forbidden references", () => {
  for (const token of FORBIDDEN_ANYWHERE) {
    it(`never mentions ${token}`, () => {
      const offenders = lines.filter((l) => l.includes(token));
      expect(offenders).toEqual([]);
    });
  }

  for (const token of SITEMAP_ONLY) {
    it(`only references ${token} on a Sitemap: directive`, () => {
      const offenders = lines.filter((l) => {
        if (!l.includes(token)) return false;
        return !/^\s*Sitemap:\s*/i.test(l);
      });
      expect(offenders).toEqual([]);
    });
  }

  it("never disallows or allows any forbidden token via a rule directive", () => {
    const allTokens = [...FORBIDDEN_ANYWHERE, ...SITEMAP_ONLY];
    const offenders = lines.filter((l) => {
      if (!/^\s*(Allow|Disallow):\s*/i.test(l)) return false;
      return allTokens.some((t) => l.includes(t));
    });
    expect(offenders).toEqual([]);
  });
});
