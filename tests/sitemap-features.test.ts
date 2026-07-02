/**
 * Verifies /sitemap-features.xml lists every /features/$slug URL exactly
 * once, using absolute canonical URLs on the apex origin.
 *
 * Run: `bunx vitest run tests/sitemap-features.test.ts`
 * Override target host: `SITE_ORIGIN=https://<other>.lovable.app bunx vitest run tests/sitemap-features.test.ts`
 */

import { describe, it, expect, beforeAll } from "vitest";
import { features } from "../src/data/features";
import { canonicalUrl, SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";
const APEX = DEFAULT_ORIGIN;

let xml = "";
let locs: string[] = [];

beforeAll(async () => {
  const res = await fetch(`${SITE_ORIGIN}/sitemap-features.xml`);
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type") ?? "").toMatch(/xml/i);
  xml = await res.text();
  locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
});

describe("/sitemap-features.xml", () => {
  it("is valid XML with a urlset root", () => {
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(xml).toMatch(/<urlset\b/);
    expect(xml).toMatch(/<\/urlset>/);
  });

  it("lists every unique feature slug exactly once", () => {
    const expected = new Set(features.map((f) => canonicalUrl(`/features/${f.id}`)));
    const actual = new Set(locs);

    // No duplicate <loc> entries in the emitted XML.
    expect(locs.length).toBe(actual.size);

    // Exact set match against the deduped feature slugs.
    expect(actual).toEqual(expected);
    expect(locs.length).toBe(expected.size);
  });

  it("uses absolute apex URLs with the canonical origin and /features/ prefix", () => {
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc.startsWith(`${APEX}/features/`)).toBe(true);
      // No trailing slash on leaf paths.
      expect(loc.endsWith("/")).toBe(false);
      // No query or fragment drift.
      expect(loc).not.toMatch(/[?#]/);
      // Parseable and same-origin as canonical apex.
      const u = new URL(loc);
      expect(`${u.protocol}//${u.host}`).toBe(APEX);
    }
  });

  it("includes each <url> entry with lastmod, changefreq, and priority", () => {
    const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    expect(urlBlocks.length).toBe(locs.length);
    for (const block of urlBlocks) {
      expect(block).toMatch(/<loc>https?:\/\/[^<]+<\/loc>/);
      expect(block).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
      expect(block).toMatch(/<changefreq>\w+<\/changefreq>/);
      expect(block).toMatch(/<priority>[0-9.]+<\/priority>/);
    }
  });
});
