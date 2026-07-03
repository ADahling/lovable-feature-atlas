/**
 * Combined uniqueness test: on every /features/$slug page,
 *   1. exactly one TechArticle node exists (across every <script> and @graph), and
 *   2. Organization and WebSite each appear at most once — no duplicates from
 *      the root shell leaking a second copy alongside a leaf-emitted one.
 *
 * Complements feature-jsonld-single-techarticle (TechArticle count only) by
 * also guarding the sitewide Organization/WebSite nodes from duplication.
 *
 * Run:    `bunx vitest run tests/feature-jsonld-no-duplicate-schema.test.ts`
 * Subset: `FEATURE_SAMPLE=10 bunx vitest run tests/feature-jsonld-no-duplicate-schema.test.ts`
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

/** Yield every object node from a parsed JSON-LD value, recursing into @graph. */
function* walkNodes(value: unknown): Generator<Record<string, unknown>> {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const v of value) yield* walkNodes(v);
    return;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    yield obj;
    if (Array.isArray(obj["@graph"])) yield* walkNodes(obj["@graph"]);
  }
}

async function countTopLevelTypes(path: string): Promise<Record<string, number>> {
  const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
  expect(res.status, `${path}: status`).toBe(200);
  const html = await res.text();

  const rawBlocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);

  const counts: Record<string, number> = {};
  for (const raw of rawBlocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`${path}: invalid JSON-LD block: ${raw.slice(0, 120)}…`);
    }
    for (const node of walkNodes(parsed)) {
      const t = node["@type"];
      if (typeof t !== "string") continue;
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  return counts;
}

const sample = pickSample(features, SAMPLE);

describe(`Feature page JSON-LD has no duplicate schema (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: exactly one TechArticle and no duplicate Organization/WebSite",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const counts = await countTopLevelTypes(path);

      expect(
        counts.TechArticle ?? 0,
        `${path}: expected 1 TechArticle, got ${counts.TechArticle ?? 0}`,
      ).toBe(1);

      expect(
        counts.Organization ?? 0,
        `${path}: Organization must appear at most once, got ${counts.Organization ?? 0}`,
      ).toBeLessThanOrEqual(1);

      expect(
        counts.WebSite ?? 0,
        `${path}: WebSite must appear at most once, got ${counts.WebSite ?? 0}`,
      ).toBeLessThanOrEqual(1);
    },
    30_000,
  );
});
