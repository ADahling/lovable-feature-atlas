/**
 * Cross-tag consistency: on every /features/$slug page, the OpenGraph tags
 * line up with the TechArticle JSON-LD:
 *
 *   - og:url         === TechArticle.url             (exact string)
 *   - og:title       includes TechArticle.headline   (title is name-suffixed)
 *   - og:description present and non-empty
 *
 * Prevents drift between social-share tags and structured data — a common
 * source of mismatched previews vs. search snippets.
 *
 * Run:    `bunx vitest run tests/feature-og-jsonld-match.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-og-jsonld-match.test.ts`
 */

import { describe, it, expect } from "vitest";
import { features, type Feature } from "../src/data/features";
import { canonicalUrl, SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const SAMPLE = process.env.FEATURE_SAMPLE ? Number(process.env.FEATURE_SAMPLE) : 0;

function pickSample(list: Feature[], n: number): Feature[] {
  if (!n || n >= list.length) return list;
  const stride = Math.floor(list.length / n);
  const out: Feature[] = [];
  for (let i = 0; i < list.length && out.length < n; i += stride) out.push(list[i]);
  return out;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function extractMeta(html: string, key: "property" | "name", value: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+${key}=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*${key}=["']${value}["'][^>]*>`,
      "i",
    ),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return decodeHtml(m[1]);
  }
  return null;
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
    } else if (
      value &&
      typeof value === "object" &&
      Array.isArray((value as { "@graph"?: unknown[] })["@graph"])
    ) {
      for (const v of (value as { "@graph": unknown[] })["@graph"]) {
        out.push(v as Record<string, unknown>);
      }
    } else {
      out.push(value as Record<string, unknown>);
    }
  }
  return out;
}

const sample = pickSample(features, SAMPLE);

describe(`OpenGraph tags match TechArticle JSON-LD (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: og:title/og:description/og:url align with TechArticle headline/description/url",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const expectedUrl = canonicalUrl(path);
      const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
      expect(res.status, `${path}: status`).toBe(200);
      const html = await res.text();

      const ogTitle = extractMeta(html, "property", "og:title");
      const ogDescription = extractMeta(html, "property", "og:description");
      const ogUrl = extractMeta(html, "property", "og:url");
      expect(ogTitle, `${path}: og:title present`).not.toBeNull();
      expect(ogDescription, `${path}: og:description present`).not.toBeNull();
      expect(ogUrl, `${path}: og:url present`).not.toBeNull();

      const blocks = extractJsonLdBlocks(html);
      const article = blocks.find((b) => b?.["@type"] === "TechArticle");
      expect(article, `${path}: TechArticle JSON-LD block present`).toBeDefined();

      const headline = article!.headline;
      const jsonUrl = article!.url;
      expect(typeof headline, `${path}: TechArticle.headline is string`).toBe("string");
      expect(typeof jsonUrl, `${path}: TechArticle.url is string`).toBe("string");

      // og:url === TechArticle.url (exact, canonical apex URL).
      expect(ogUrl, `${path}: og:url === TechArticle.url`).toBe(jsonUrl);
      expect(ogUrl, `${path}: og:url matches canonicalUrl()`).toBe(expectedUrl);

      // og:title contains the JSON-LD headline verbatim (title is name-suffixed).
      expect(ogTitle!.includes(headline as string), `${path}: og:title contains headline`).toBe(true);

      // og:description present and non-empty.
      expect(ogDescription!.trim().length, `${path}: og:description non-empty`).toBeGreaterThan(0);
    },
    30_000,
  );
});
