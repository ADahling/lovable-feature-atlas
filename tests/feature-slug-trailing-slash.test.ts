/**
 * Trailing-slash test: requesting /features/$slug/ must either
 *   (a) return 200 directly, or
 *   (b) redirect (301/307/308) to the canonical /features/$slug (no trailing slash)
 * and the final resolved page must still render the TechArticle JSON-LD for
 * that feature (matching headline + canonical URL).
 *
 * Run:    `bunx vitest run tests/feature-slug-trailing-slash.test.ts`
 * Subset: `FEATURE_SAMPLE=10 bunx vitest run tests/feature-slug-trailing-slash.test.ts`
 */

import { describe, it, expect } from "vitest";
import { features, type Feature } from "../src/data/features";
import { SITE_ORIGIN as DEFAULT_ORIGIN, canonicalUrl } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const SAMPLE = process.env.FEATURE_SAMPLE ? Number(process.env.FEATURE_SAMPLE) : 8;

function pickSample(list: Feature[], n: number): Feature[] {
  if (!n || n >= list.length) return list;
  const stride = Math.floor(list.length / n);
  const out: Feature[] = [];
  for (let i = 0; i < list.length && out.length < n; i += stride) out.push(list[i]);
  return out;
}

function extractJsonLdBlocks(html: string): unknown[] {
  const raw = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);
  const nodes: unknown[] = [];
  for (const body of raw) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      continue;
    }
    const arr = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as any)["@graph"])
        ? (parsed as any)["@graph"]
        : [parsed];
    nodes.push(...arr);
  }
  return nodes;
}

const sample = pickSample(features, SAMPLE);

describe(`Trailing-slash /features/$slug/ resolves canonically (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: trailing slash resolves to canonical URL with TechArticle JSON-LD",
    async (_slug, feature) => {
      const trailingPath = `/features/${feature.id}/`;
      const canonicalPath = `/features/${feature.id}`;
      const expectedCanonical = canonicalUrl(canonicalPath);

      // 1. Inspect the raw response WITHOUT following redirects.
      const noFollow = await fetch(`${SITE_ORIGIN}${trailingPath}`, { redirect: "manual" });
      const status = noFollow.status;

      expect(
        [200, 301, 307, 308].includes(status),
        `${trailingPath}: expected 200 or 301/307/308, got ${status}`,
      ).toBe(true);

      if (status !== 200) {
        const location = noFollow.headers.get("location") ?? "";
        // Redirect target must land on the canonical (no-trailing-slash) path,
        // not a further redirect chain or a query-string variant.
        const target = location.startsWith("http")
          ? new URL(location).pathname
          : location.split("?")[0].split("#")[0];
        expect(target, `${trailingPath}: redirect target`).toBe(canonicalPath);
      }

      // 2. Follow through and verify final page renders the correct schema.
      const finalRes = await fetch(`${SITE_ORIGIN}${trailingPath}`, { redirect: "follow" });
      expect(finalRes.status, `${trailingPath}: final status`).toBe(200);
      // The resolved URL should be the canonical apex form.
      expect(finalRes.url, `${trailingPath}: final URL`).toBe(expectedCanonical);

      const html = await finalRes.text();
      const nodes = extractJsonLdBlocks(html);
      const techArticles = nodes.filter(
        (n) => n && typeof n === "object" && (n as any)["@type"] === "TechArticle",
      ) as Array<Record<string, unknown>>;

      expect(techArticles.length, `${trailingPath}: exactly one TechArticle`).toBe(1);
      const article = techArticles[0];
      expect(article.headline, `${trailingPath}: TechArticle.headline`).toBe(feature.name);
      expect(article.url, `${trailingPath}: TechArticle.url matches canonical`).toBe(
        expectedCanonical,
      );
    },
    30_000,
  );
});
