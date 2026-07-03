/**
 * Snapshot the schema-related tags on representative /features/$slug pages —
 * every <script type="application/ld+json"> block, normalized and ordered
 * deterministically. Non-schema head tags (title, description, og:*, canonical)
 * are covered by tests/feature-head-snapshot.test.ts and are intentionally
 * excluded here so this snapshot only churns when schema shape changes.
 *
 * Normalization rules:
 *   - Blocks and top-level @graph entries are sorted by @type so ordering
 *     inside the head doesn't matter.
 *   - Each TechArticle's `headline`, `url`, and `mainEntityOfPage` are
 *     replaced with sentinel placeholders (asserted separately as hard
 *     invariants) so the snapshot captures STRUCTURE, not per-feature values.
 *   - `datePublished`, when present, is normalized to "<ISO_DATE>".
 *
 * Run:    `bunx vitest run tests/feature-schema-snapshot.test.ts`
 * Update: append `-u` after an intentional schema change.
 */

import { describe, it, expect } from "vitest";
import { features } from "../src/data/features";
import { canonicalUrl, SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;

// Same triad used by feature-head-snapshot: early GA, mid-catalog, recent.
const REPRESENTATIVE_SLUGS = ["agent-mode", "plan-mode", "gemini-3-pro"] as const;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/;

function extractJsonLdBlocks(html: string): unknown[] {
  return Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => JSON.parse(m[1]));
}

/** Normalize a JSON-LD node so the snapshot captures shape, not per-feature values. */
function normalize(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(normalize);
  if (!node || typeof node !== "object") return node;
  const src = node as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(src)) {
    if (k === "@graph" && Array.isArray(v)) {
      out[k] = v
        .map(normalize)
        .sort((a, b) => String((a as any)?.["@type"] ?? "").localeCompare(String((b as any)?.["@type"] ?? "")));
      continue;
    }
    if (src["@type"] === "TechArticle") {
      if (k === "headline") { out[k] = "<FEATURE_HEADLINE>"; continue; }
      if (k === "url" || k === "mainEntityOfPage") { out[k] = "<FEATURE_URL>"; continue; }
      if (k === "description") { out[k] = "<FEATURE_DESCRIPTION>"; continue; }
      if (k === "datePublished" && typeof v === "string" && ISO_DATE_RE.test(v)) {
        out[k] = "<ISO_DATE>";
        continue;
      }
    }
    out[k] = normalize(v);
  }
  return out;
}

async function fetchSchemaShape(slug: string) {
  const res = await fetch(`${SITE_ORIGIN}/features/${slug}`, { redirect: "follow" });
  expect(res.status, `/features/${slug} should 200`).toBe(200);
  const html = await res.text();

  const blocks = extractJsonLdBlocks(html).map(normalize);
  // Order blocks by their primary @type (root graph vs leaf article) so
  // insertion order in the head doesn't churn the snapshot.
  blocks.sort((a, b) => {
    const at = String((a as any)?.["@type"] ?? (a as any)?.["@graph"]?.[0]?.["@type"] ?? "");
    const bt = String((b as any)?.["@type"] ?? (b as any)?.["@graph"]?.[0]?.["@type"] ?? "");
    return at.localeCompare(bt);
  });
  return { blockCount: blocks.length, blocks };
}

describe("feature detail — schema (JSON-LD) tag snapshots", () => {
  it.each(REPRESENTATIVE_SLUGS)(
    "%s: JSON-LD structure matches snapshot",
    async (slug) => {
      const feature = features.find((f) => f.id === slug);
      expect(feature, `dataset must contain '${slug}' — update REPRESENTATIVE_SLUGS`).toBeDefined();

      const shape = await fetchSchemaShape(slug);
      const expectedUrl = canonicalUrl(`/features/${slug}`);

      // Hard invariants — asserted before snapshotting so per-feature values
      // can be normalized without losing correctness coverage.
      expect(shape.blockCount, "at least one JSON-LD block").toBeGreaterThan(0);

      // Locate the (unnormalized) TechArticle to verify per-feature values.
      const rawHtml = await fetch(`${SITE_ORIGIN}/features/${slug}`).then((r) => r.text());
      const rawBlocks = extractJsonLdBlocks(rawHtml);
      const article = rawBlocks
        .flatMap((b: any) => (Array.isArray(b?.["@graph"]) ? b["@graph"] : [b]))
        .find((n: any) => n?.["@type"] === "TechArticle");
      expect(article, "TechArticle JSON-LD present").toBeDefined();
      expect(article.headline, "headline is feature name").toBe(feature!.name);
      expect(article.url, "url self-references").toBe(expectedUrl);
      expect(article.mainEntityOfPage, "mainEntityOfPage self-references").toBe(expectedUrl);

      // The snapshot captures schema STRUCTURE only.
      expect(shape).toMatchSnapshot();
    },
    30_000,
  );
});
