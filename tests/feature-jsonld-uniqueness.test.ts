/**
 * Structural JSON-LD test: every /features/$slug page includes EXACTLY ONE
 * TechArticle block, and across all JSON-LD blocks on the page there are
 * no duplicate `url` or `mainEntityOfPage` values.
 *
 * Complements tests/feature-jsonld.test.ts (which validates field values)
 * by enforcing uniqueness invariants that catch accidental double-embedding
 * (e.g. from both a root and leaf head() emitting the same block).
 *
 * Run: `bunx vitest run tests/feature-jsonld-uniqueness.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-jsonld-uniqueness.test.ts`
 */

import { describe, it, expect } from "vitest";
import { features, type Feature } from "../src/data/features";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const SAMPLE = process.env.FEATURE_SAMPLE ? Number(process.env.FEATURE_SAMPLE) : 0;

function pickSample(list: Feature[], n: number): Feature[] {
  if (!n || n >= list.length) return list;
  const stride = Math.floor(list.length / n);
  const out: Feature[] = [];
  for (let i = 0; i < list.length && out.length < n; i += stride) out.push(list[i]);
  return out;
}

async function fetchJsonLdBlocks(path: string): Promise<Array<Record<string, unknown>>> {
  const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
  expect(res.status, `${path} status`).toBe(200);
  const html = await res.text();
  const raw = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);

  const parsed: Array<Record<string, unknown>> = [];
  for (const r of raw) {
    // Each block must be syntactically valid JSON.
    const value = JSON.parse(r);
    // Flatten @graph arrays so uniqueness checks catch nested duplicates too.
    if (Array.isArray(value)) {
      for (const v of value) parsed.push(v as Record<string, unknown>);
    } else if (value && typeof value === "object" && Array.isArray((value as any)["@graph"])) {
      for (const v of (value as any)["@graph"]) parsed.push(v as Record<string, unknown>);
    } else {
      parsed.push(value as Record<string, unknown>);
    }
  }
  return parsed;
}

const sample = pickSample(features, SAMPLE);

describe(`Feature JSON-LD uniqueness (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: exactly one TechArticle and no duplicate url/mainEntityOfPage",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const blocks = await fetchJsonLdBlocks(path);

      // Exactly one TechArticle block.
      const techArticles = blocks.filter((b) => b?.["@type"] === "TechArticle");
      expect(techArticles.length, `${path}: TechArticle block count`).toBe(1);

      // No duplicate `url` values across all JSON-LD blocks on the page.
      const urls = blocks
        .map((b) => b?.url)
        .filter((v): v is string => typeof v === "string" && v.length > 0);
      expect(urls.length, `${path}: at least one block has url`).toBeGreaterThan(0);
      expect(new Set(urls).size, `${path}: duplicate url values → ${urls.join(", ")}`).toBe(
        urls.length,
      );

      // No duplicate `mainEntityOfPage` values across blocks.
      const meop = blocks
        .map((b) => b?.mainEntityOfPage)
        .filter((v): v is string => typeof v === "string" && v.length > 0);
      expect(meop.length, `${path}: at least one block has mainEntityOfPage`).toBeGreaterThan(0);
      expect(
        new Set(meop).size,
        `${path}: duplicate mainEntityOfPage values → ${meop.join(", ")}`,
      ).toBe(meop.length);
    },
    30_000,
  );
});
