/**
 * Each /features/$slug page's TechArticle JSON-LD must expose an @id that
 * exactly equals the page's canonical URL (and, transitively, the tag's own
 * url / mainEntityOfPage fields). @id is the graph-wide stable identifier
 * downstream consumers (Google, LLM crawlers) use to dedupe entities.
 *
 * Run:    `bunx vitest run tests/feature-jsonld-id.test.ts`
 * Subset: `FEATURE_SAMPLE=10 bunx vitest run tests/feature-jsonld-id.test.ts`
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

async function fetchTechArticle(path: string): Promise<Record<string, unknown>> {
  const res = await cachedFetch(`${SITE_ORIGIN}${path}`);
  expect(res.status, `${path} status`).toBe(200);
  const html = await res.text();
  const blocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);

  const nodes: unknown[] = [];
  for (const body of blocks) {
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

  const techArticles = nodes.filter(
    (n): n is Record<string, unknown> =>
      !!n && typeof n === "object" && (n as any)["@type"] === "TechArticle",
  );
  expect(techArticles.length, `${path}: exactly one TechArticle node`).toBe(1);
  return techArticles[0];
}

const sample = pickSample(features, SAMPLE);

describe(`TechArticle @id matches canonical URL (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: TechArticle @id equals canonical URL",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const expected = canonicalUrl(path);
      const article = await fetchTechArticle(path);

      const id = article["@id"];
      expect(typeof id, `${path}: @id must be a string`).toBe("string");
      expect(id, `${path}: @id equals canonical URL`).toBe(expected);

      // @id, url, and mainEntityOfPage must all agree — otherwise the
      // entity is ambiguous to downstream consumers.
      expect(article.url, `${path}: url equals @id`).toBe(id);
      expect(article.mainEntityOfPage, `${path}: mainEntityOfPage equals @id`).toBe(id);

      // Guard against accidental trailing slash or query-string drift in @id.
      expect(id as string, `${path}: @id has no trailing slash`).not.toMatch(/\/$/);
      expect(id as string, `${path}: @id has no query/hash`).not.toMatch(/[?#]/);
    },
    30_000,
  );
});
