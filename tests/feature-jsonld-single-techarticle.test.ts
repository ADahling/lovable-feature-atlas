/**
 * Single-TechArticle guard: across every JSON-LD block on a /features/$slug
 * page — including entries nested inside `@graph` arrays or top-level JSON
 * arrays — exactly one node has `@type: "TechArticle"`. All other schema
 * blocks (WebSite, Organization, BreadcrumbList, etc.) are allowed, but no
 * additional TechArticle may sneak in from the root route, a layout, or a
 * future component.
 *
 * Run:    `bunx vitest run tests/feature-jsonld-single-techarticle.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-jsonld-single-techarticle.test.ts`
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

/** Recursively walk a JSON-LD value and yield every object node. */
function* walkNodes(value: unknown): Generator<Record<string, unknown>> {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const v of value) yield* walkNodes(v);
    return;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    yield obj;
    // Recurse into common containers that can nest more nodes.
    if (Array.isArray(obj["@graph"])) yield* walkNodes(obj["@graph"]);
  }
}

async function collectTechArticleNodes(
  path: string,
): Promise<{ count: number; sources: string[] }> {
  const res = await cachedFetch(`${SITE_ORIGIN}${path}`);
  expect(res.status, `${path}: status`).toBe(200);
  const html = await res.text();

  const rawBlocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);

  let count = 0;
  const sources: string[] = [];
  for (const raw of rawBlocks) {
    const parsed = JSON.parse(raw);
    for (const node of walkNodes(parsed)) {
      if (node?.["@type"] === "TechArticle") {
        count += 1;
        sources.push(JSON.stringify(node).slice(0, 200));
      }
    }
  }
  return { count, sources };
}

const sample = pickSample(features, SAMPLE);

describe(`Only one TechArticle across all JSON-LD (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: exactly one TechArticle node across every script/@graph entry",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const { count, sources } = await collectTechArticleNodes(path);
      expect(
        count,
        `${path}: expected 1 TechArticle, found ${count}\n${sources.join("\n---\n")}`,
      ).toBe(1);
    },
    30_000,
  );
});
