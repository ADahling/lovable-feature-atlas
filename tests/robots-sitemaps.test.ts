/**
 * Verifies robots.txt references both sitemaps with absolute apex URLs
 * and that each URL is reachable and serves XML.
 *
 * Run: `bunx vitest run tests/robots-sitemaps.test.ts`
 * Override target host: `SITE_ORIGIN=https://<other>.lovable.app bunx vitest run tests/robots-sitemaps.test.ts`
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SITE_ORIGIN as APEX } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";

const staticRobots = readFileSync(resolve(__dirname, "../public/robots.txt"), "utf8");
let servedRobots = "";

beforeAll(async () => {
  const res = await fetch(`${SITE_ORIGIN}/robots.txt`);
  expect(res.status).toBe(200);
  servedRobots = await res.text();
});

function sitemapDirectives(txt: string): string[] {
  return txt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^sitemap:/i.test(l))
    .map((l) => l.replace(/^sitemap:\s*/i, ""));
}

describe("robots.txt sitemap references", () => {
  it("static file lists both sitemaps as absolute apex URLs", () => {
    const dirs = sitemapDirectives(staticRobots);
    expect(dirs).toContain(`${APEX}/sitemap.xml`);
    expect(dirs).toContain(`${APEX}/sitemap-features.xml`);
  });

  it("served /robots.txt lists both sitemaps as absolute apex URLs", () => {
    const dirs = sitemapDirectives(servedRobots);
    expect(dirs).toContain(`${APEX}/sitemap.xml`);
    expect(dirs).toContain(`${APEX}/sitemap-features.xml`);
  });

  it("has no relative or duplicate sitemap references", () => {
    const dirs = sitemapDirectives(servedRobots);
    // Unique.
    expect(new Set(dirs).size).toBe(dirs.length);
    // All absolute https URLs on the canonical origin.
    for (const d of dirs) {
      expect(d.startsWith(`${APEX}/`)).toBe(true);
      const u = new URL(d);
      expect(`${u.protocol}//${u.host}`).toBe(APEX);
    }
  });

  it("each referenced sitemap is reachable and serves XML", async () => {
    const paths = ["/sitemap.xml", "/sitemap-features.xml"];
    for (const path of paths) {
      const res = await fetch(`${SITE_ORIGIN}${path}`);
      expect(res.status, `${path} status`).toBe(200);
      expect(res.headers.get("content-type") ?? "", `${path} content-type`).toMatch(/xml/i);
      const body = await res.text();
      expect(body, `${path} body`).toMatch(/<urlset\b/);
    }
  });
});
