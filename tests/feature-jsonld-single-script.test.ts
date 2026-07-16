/**
 * Asserts that every /features/$slug page emits exactly one
 * <script type="application/ld+json"> block that contains a TechArticle.
 *
 * Feature pages ship two JSON-LD script tags total:
 *   - the sitewide root graph from __root.tsx (Organization + WebSite)
 *   - the leaf TechArticle from features.$slug.tsx
 * This test locks in that the TechArticle appears in EXACTLY one script
 * block — never duplicated by a stray head() override or root leak.
 *
 * Run:    `bunx vitest run tests/feature-jsonld-single-script.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-jsonld-single-script.test.ts`
 */

import { cachedFetch } from "./_helpers/cached-fetch";
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

/** Count JSON-LD script tags whose parsed payload contains a TechArticle
 * either as its top-level @type or inside its @graph. */
function countTechArticleScripts(html: string): number {
  const blocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);

  let count = 0;
  for (const raw of blocks) {
    const value = JSON.parse(raw);
    const roots = Array.isArray(value) ? value : [value];
    for (const root of roots) {
      if (!root || typeof root !== "object") continue;
      if ((root as { "@type"?: unknown })["@type"] === "TechArticle") {
        count += 1;
        break;
      }
      const graph = (root as { "@graph"?: unknown })["@graph"];
      if (Array.isArray(graph) && graph.some((g) => g && (g as { "@type"?: unknown })["@type"] === "TechArticle")) {
        count += 1;
        break;
      }
    }
  }
  return count;
}

const sample = pickSample(features, SAMPLE);

describe(`Exactly one TechArticle JSON-LD script per feature page (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: renders exactly one TechArticle JSON-LD script tag",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const res = await cachedFetch(`${SITE_ORIGIN}${path}`);
      expect(res.status, `${path}: status`).toBe(200);
      const html = await res.text();

      const count = countTechArticleScripts(html);
      expect(count, `${path}: expected exactly one TechArticle JSON-LD script tag`).toBe(1);
    },
    30_000,
  );
});
