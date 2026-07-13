/**
 * Structural guard for JSON-LD on /features/$slug pages:
 *
 *   1. Every top-level JSON-LD node (script block or @graph member) has a
 *      string @type.
 *   2. Exactly one node is @type "TechArticle" — the per-feature article.
 *   3. Every other top-level @type belongs to the sitewide allowlist
 *      (Organization, WebSite emitted from __root.tsx). No stray types.
 *   4. The TechArticle carries the expected structural shape: string
 *      headline, string url, an `about` object typed SoftwareApplication,
 *      and an `author` object typed Person.
 *
 * Nested @type values inside a top-level node (e.g. `author.@type` = Person,
 * `about.@type` = SoftwareApplication, `founder.@type` = Person) are NOT
 * top-level and are ignored by the allowlist check.
 *
 * Run:    `bunx vitest run tests/feature-jsonld-type-structure.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-jsonld-type-structure.test.ts`
 */

import { describe, it, expect } from "vitest";
import { features, type Feature } from "../src/data/features";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const SAMPLE = process.env.FEATURE_SAMPLE ? Number(process.env.FEATURE_SAMPLE) : 0;

/** Top-level @type values expected on every feature page.
 * - TechArticle + FAQPage come from the leaf route (features.$slug.tsx).
 * - Person + Organization + WebSite come from __root.tsx's @graph.
 * If the root graph gains a new node, add it here, this is the whitelist. */
const ALLOWED_TOP_LEVEL_TYPES = new Set([
  "TechArticle",
  "FAQPage",
  "Person",
  "Organization",
  "WebSite",
]);

function pickSample(list: Feature[], n: number): Feature[] {
  if (!n || n >= list.length) return list;
  const stride = Math.floor(list.length / n);
  const out: Feature[] = [];
  for (let i = 0; i < list.length && out.length < n; i += stride) out.push(list[i]);
  return out;
}

/**
 * Return every top-level JSON-LD node on the page. A "top-level" node is
 * either a script block payload or a member of a script block's `@graph`.
 * Nested objects (like TechArticle.author) are intentionally NOT returned.
 */
function extractTopLevelJsonLdNodes(html: string): Array<Record<string, unknown>> {
  const raw = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);
  const out: Array<Record<string, unknown>> = [];
  for (const r of raw) {
    const value = JSON.parse(r);
    const roots = Array.isArray(value) ? value : [value];
    for (const root of roots) {
      if (!root || typeof root !== "object") continue;
      const graph = (root as { "@graph"?: unknown })["@graph"];
      if (Array.isArray(graph)) {
        for (const g of graph) {
          if (g && typeof g === "object") out.push(g as Record<string, unknown>);
        }
      } else {
        out.push(root as Record<string, unknown>);
      }
    }
  }
  return out;
}

const sample = pickSample(features, SAMPLE);

describe(`JSON-LD @type structure on feature pages (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: single TechArticle + only allowlisted top-level @types",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
      expect(res.status, `${path}: status`).toBe(200);
      const html = await res.text();

      const nodes = extractTopLevelJsonLdNodes(html);
      expect(nodes.length, `${path}: at least one top-level JSON-LD node`).toBeGreaterThan(0);

      // 1) Every top-level node has a string @type.
      for (const [i, n] of nodes.entries()) {
        expect(typeof n["@type"], `${path}: node[${i}].@type is string`).toBe("string");
      }

      const topTypes = nodes.map((n) => n["@type"] as string);

      // 2) Exactly one TechArticle at top level.
      const techArticleCount = topTypes.filter((t) => t === "TechArticle").length;
      expect(techArticleCount, `${path}: exactly one top-level TechArticle`).toBe(1);

      // 3) Every top-level @type is on the allowlist — no strays.
      const stray = topTypes.filter((t) => !ALLOWED_TOP_LEVEL_TYPES.has(t));
      expect(stray, `${path}: unexpected top-level @types`).toEqual([]);

      // 4) TechArticle structural shape.
      const article = nodes.find((n) => n["@type"] === "TechArticle")!;
      expect(typeof article.headline, `${path}: TechArticle.headline is string`).toBe("string");
      expect(typeof article.url, `${path}: TechArticle.url is string`).toBe("string");

      const about = article.about as Record<string, unknown> | undefined;
      expect(about, `${path}: TechArticle.about present`).toBeDefined();
      expect(about!["@type"], `${path}: TechArticle.about.@type`).toBe("SoftwareApplication");

      const author = article.author as Record<string, unknown> | undefined;
      expect(author, `${path}: TechArticle.author present`).toBeDefined();
      expect(author!["@type"], `${path}: TechArticle.author.@type`).toBe("Person");
    },
    30_000,
  );
});
