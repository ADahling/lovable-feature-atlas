/**
 * Cross-tag consistency: on every /features/$slug page, the <link rel="canonical">
 * href must exactly equal the TechArticle JSON-LD `url` (and `mainEntityOfPage`)
 * value. Prevents drift between the head canonical and the structured-data URL,
 * which confuses crawlers about which URL owns the content.
 *
 * Run:    `bunx vitest run tests/feature-canonical-jsonld-match.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-canonical-jsonld-match.test.ts`
 */

import { cachedFetch } from "./_helpers/cached-fetch";
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

function extractCanonicalHref(html: string): string | null {
  // Match <link rel="canonical" href="..."> in either attribute order.
  const patterns = [
    /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
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
    } else if (value && typeof value === "object" && Array.isArray((value as any)["@graph"])) {
      for (const v of (value as any)["@graph"]) out.push(v as Record<string, unknown>);
    } else {
      out.push(value as Record<string, unknown>);
    }
  }
  return out;
}

const sample = pickSample(features, SAMPLE);

describe(`Canonical <link> matches TechArticle JSON-LD url (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: canonical href === TechArticle.url === TechArticle.mainEntityOfPage",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const expectedUrl = canonicalUrl(path);
      const res = await cachedFetch(`${SITE_ORIGIN}${path}`);
      expect(res.status, `${path}: status`).toBe(200);
      const html = await res.text();

      const canonical = extractCanonicalHref(html);
      expect(canonical, `${path}: <link rel="canonical"> present`).not.toBeNull();

      const blocks = extractJsonLdBlocks(html);
      const article = blocks.find((b) => b?.["@type"] === "TechArticle");
      expect(article, `${path}: TechArticle JSON-LD block present`).toBeDefined();

      const jsonUrl = article!.url;
      const jsonMeop = article!.mainEntityOfPage;

      expect(typeof jsonUrl, `${path}: TechArticle.url is string`).toBe("string");
      expect(typeof jsonMeop, `${path}: TechArticle.mainEntityOfPage is string`).toBe("string");

      // Exact-string equality — no trailing-slash, protocol, or host drift.
      expect(canonical, `${path}: canonical === TechArticle.url`).toBe(jsonUrl);
      expect(canonical, `${path}: canonical === TechArticle.mainEntityOfPage`).toBe(jsonMeop);

      // And both align with the app's computed canonical for this path.
      expect(canonical, `${path}: canonical matches canonicalUrl()`).toBe(expectedUrl);
    },
    30_000,
  );
});
