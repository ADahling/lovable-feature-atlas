/**
 * Focused parse test: every /features/$slug page must contain a TechArticle
 * JSON-LD block whose raw contents parse as valid JSON via JSON.parse().
 *
 * Complements feature-jsonld.test.ts (field values) and
 * feature-jsonld-uniqueness.test.ts (structural uniqueness) by isolating the
 * "is this parseable JSON?" invariant so a regression surfaces here first.
 *
 * Run:    `bunx vitest run tests/feature-jsonld-parse.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-jsonld-parse.test.ts`
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

async function fetchRawJsonLdBlocks(path: string): Promise<string[]> {
  const res = await cachedFetch(`${SITE_ORIGIN}${path}`);
  expect(res.status, `${path} status`).toBe(200);
  const html = await res.text();
  return Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);
}

const sample = pickSample(features, SAMPLE);

describe(`TechArticle JSON-LD is parseable JSON (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: TechArticle block parses cleanly",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const raw = await fetchRawJsonLdBlocks(path);
      expect(raw.length, `${path}: at least one JSON-LD block`).toBeGreaterThan(0);

      let techArticleFound = false;
      for (const body of raw) {
        let parsed: unknown;
        expect(
          () => {
            parsed = JSON.parse(body);
          },
          `${path}: JSON.parse failed for block → ${body.slice(0, 120)}…`,
        ).not.toThrow();

        // Flatten @graph so a TechArticle nested inside a graph still counts.
        const candidates: unknown[] = Array.isArray(parsed)
          ? parsed
          : parsed && typeof parsed === "object" && Array.isArray((parsed as any)["@graph"])
            ? (parsed as any)["@graph"]
            : [parsed];

        for (const c of candidates) {
          if (c && typeof c === "object" && (c as any)["@type"] === "TechArticle") {
            techArticleFound = true;
          }
        }
      }

      expect(techArticleFound, `${path}: TechArticle JSON-LD block present`).toBe(true);
    },
    30_000,
  );
});
