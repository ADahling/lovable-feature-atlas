/**
 * Cross-source consistency: every /features/$slug page must be listed in
 * /sitemap-features.xml, and its <loc> must exactly equal the TechArticle
 * JSON-LD `url` (and `mainEntityOfPage`) rendered on that page.
 *
 * Run:    `bunx vitest run tests/feature-sitemap-jsonld-match.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-sitemap-jsonld-match.test.ts`
 */

import { describe, it, expect, beforeAll } from "vitest";
import { features, type Feature } from "../src/data/features";
import { canonicalUrl, SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";
const APEX = DEFAULT_ORIGIN;
const SAMPLE = process.env.FEATURE_SAMPLE ? Number(process.env.FEATURE_SAMPLE) : 0;

function pickSample(list: Feature[], n: number): Feature[] {
  if (!n || n >= list.length) return list;
  const stride = Math.floor(list.length / n);
  const out: Feature[] = [];
  for (let i = 0; i < list.length && out.length < n; i += stride) out.push(list[i]);
  return out;
}

function extractJsonLdBlocks(html: string): Array<Record<string, unknown>> {
  const raw = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);
  const out: Array<Record<string, unknown>> = [];
  for (const r of raw) {
    const value = JSON.parse(r);
    if (Array.isArray(value)) {
      for (const v of value) out.push(v as Record<string, unknown>);
    } else if (value && typeof value === "object" && Array.isArray((value as { "@graph"?: unknown[] })["@graph"])) {
      for (const v of (value as { "@graph": unknown[] })["@graph"]) {
        out.push(v as Record<string, unknown>);
      }
    } else {
      out.push(value as Record<string, unknown>);
    }
  }
  return out;
}

let sitemapLocs: Set<string> = new Set();

beforeAll(async () => {
  const res = await fetch(`${SITE_ORIGIN}/sitemap-features.xml`);
  expect(res.status).toBe(200);
  const xml = await res.text();
  sitemapLocs = new Set(
    Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)).map((m) => m[1]),
  );
  expect(sitemapLocs.size).toBeGreaterThan(0);
});

const sample = pickSample(features, SAMPLE);

describe(`Feature pages listed in sitemap with matching JSON-LD url (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: sitemap <loc> === TechArticle.url === TechArticle.mainEntityOfPage",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const expectedUrl = canonicalUrl(path);

      // 1) Sitemap lists this feature URL exactly (absolute, apex origin).
      expect(expectedUrl.startsWith(`${APEX}/features/`)).toBe(true);
      expect(sitemapLocs.has(expectedUrl), `${path}: present in sitemap-features.xml`).toBe(true);

      // 2) Page renders TechArticle JSON-LD with matching url + mainEntityOfPage.
      const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
      expect(res.status, `${path}: status`).toBe(200);
      const html = await res.text();
      const blocks = extractJsonLdBlocks(html);
      const article = blocks.find((b) => b?.["@type"] === "TechArticle");
      expect(article, `${path}: TechArticle JSON-LD block present`).toBeDefined();

      const jsonUrl = article!.url;
      const jsonMeop = article!.mainEntityOfPage;
      expect(typeof jsonUrl, `${path}: TechArticle.url is string`).toBe("string");
      expect(typeof jsonMeop, `${path}: TechArticle.mainEntityOfPage is string`).toBe("string");

      // 3) Exact-string equality across sitemap loc, JSON-LD url, and computed canonical.
      expect(jsonUrl, `${path}: TechArticle.url === sitemap <loc>`).toBe(expectedUrl);
      expect(jsonMeop, `${path}: TechArticle.mainEntityOfPage === sitemap <loc>`).toBe(expectedUrl);
    },
    30_000,
  );
});
