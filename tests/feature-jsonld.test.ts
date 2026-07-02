/**
 * JSON-LD validation: every /features/$slug page must embed a syntactically
 * valid TechArticle block with the correct @context, @type, headline (matches
 * feature.name), description, datePublished, and self-referencing url +
 * mainEntityOfPage. Runs over the whole dataset by default; subset with
 * FEATURE_SAMPLE=N.
 *
 * Run: `SITE_ORIGIN=http://localhost:8080 bunx vitest run tests/feature-jsonld.test.ts`
 */

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

interface JsonLdResult {
  raw: string;
  parsed: Record<string, unknown> | null;
  parseError: string | null;
}

async function fetchJsonLd(path: string): Promise<JsonLdResult[]> {
  const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
  const html = await res.text();
  const scripts = Array.from(
    html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ).map((m) => m[1]);

  return scripts.map((raw) => {
    try {
      const parsed = JSON.parse(raw);
      return { raw, parsed, parseError: null };
    } catch (err) {
      return { raw, parsed: null, parseError: (err as Error).message };
    }
  });
}

function isTechArticle(x: Record<string, unknown> | null): boolean {
  return !!x && x["@type"] === "TechArticle";
}

const sample = pickSample(features, SAMPLE);

describe(`TechArticle JSON-LD validation (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s embeds a valid TechArticle block",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const expectedUrl = canonicalUrl(path);
      const blocks = await fetchJsonLd(path);

      expect(blocks.length, `${path}: at least one JSON-LD block`).toBeGreaterThan(0);

      // Every JSON-LD block on the page must be syntactically valid JSON.
      for (const b of blocks) {
        expect(b.parseError, `${path}: JSON parse error → ${b.parseError}`).toBeNull();
        expect(b.parsed, `${path}: parsed block is an object`).toBeTypeOf("object");
      }

      // Find the TechArticle block (there may also be WebSite/Organization from __root).
      const article = blocks.map((b) => b.parsed).find(isTechArticle);
      expect(article, `${path}: TechArticle block present`).toBeDefined();

      // @context + @type
      expect(article!["@context"], `${path}: @context`).toBe("https://schema.org");
      expect(article!["@type"], `${path}: @type`).toBe("TechArticle");

      // Required fields present + correctly typed
      const requiredStringFields = [
        "headline",
        "description",
        "datePublished",
        "url",
        "mainEntityOfPage",
      ] as const;
      for (const field of requiredStringFields) {
        expect(article![field], `${path}: ${field} present`).toBeDefined();
        expect(typeof article![field], `${path}: ${field} is string`).toBe("string");
        expect((article![field] as string).length, `${path}: ${field} non-empty`).toBeGreaterThan(0);
      }

      // Headline matches feature.name exactly (not truncated, not templated)
      expect(article!.headline, `${path}: headline matches feature.name`).toBe(feature.name);

      // Description matches feature.description
      expect(article!.description, `${path}: description matches feature.description`).toBe(
        feature.description,
      );

      // datePublished is a valid ISO date and matches feature.releaseDate
      expect(article!.datePublished, `${path}: datePublished matches`).toBe(feature.releaseDate);
      expect(
        Number.isNaN(new Date(article!.datePublished as string).getTime()),
        `${path}: datePublished parses as a real date`,
      ).toBe(false);

      // Self-referencing url + mainEntityOfPage — both point back at this page
      expect(article!.url, `${path}: url self-references`).toBe(expectedUrl);
      expect(article!.mainEntityOfPage, `${path}: mainEntityOfPage self-references`).toBe(
        expectedUrl,
      );

      // No accidental homepage/root drift
      expect(
        (article!.url as string).endsWith(`/features/${feature.id}`),
        `${path}: url path ends with feature slug`,
      ).toBe(true);
    },
    30_000,
  );
});
