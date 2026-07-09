/**
 * Required-fields check: every /features/$slug page's TechArticle JSON-LD block
 * must include the fields we rely on for schema.org validity and attribution:
 * @context, @type, headline, description, datePublished, url, mainEntityOfPage,
 * about (SoftwareApplication → Lovable), and author (Person → Alicia Dahling).
 *
 * Run:    `bunx vitest run tests/feature-jsonld-required-fields.test.ts`
 * Subset: `FEATURE_SAMPLE=20 bunx vitest run tests/feature-jsonld-required-fields.test.ts`
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

async function fetchTechArticle(path: string): Promise<Record<string, unknown> | undefined> {
  const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
  expect(res.status, `${path}: status`).toBe(200);
  const html = await res.text();

  const raw = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ).map((m) => m[1]);

  const parsed: Array<Record<string, unknown>> = [];
  for (const r of raw) {
    const value = JSON.parse(r);
    if (Array.isArray(value)) {
      for (const v of value) parsed.push(v as Record<string, unknown>);
    } else if (value && typeof value === "object" && Array.isArray((value as any)["@graph"])) {
      for (const v of (value as any)["@graph"]) parsed.push(v as Record<string, unknown>);
    } else {
      parsed.push(value as Record<string, unknown>);
    }
  }
  return parsed.find((b) => b?.["@type"] === "TechArticle");
}

function assertNonEmptyString(value: unknown, label: string) {
  expect(typeof value, `${label}: is string`).toBe("string");
  expect((value as string).length, `${label}: non-empty`).toBeGreaterThan(0);
}

const sample = pickSample(features, SAMPLE);

describe(`TechArticle required fields (${sample.length} of ${features.length})`, () => {
  it.each(sample.map((f) => [f.id, f] as const))(
    "%s: TechArticle block has all required fields",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const article = await fetchTechArticle(path);
      expect(article, `${path}: TechArticle block present`).toBeDefined();

      // Top-level schema markers
      expect(article!["@context"], `${path}: @context`).toBe("https://schema.org");
      expect(article!["@type"], `${path}: @type`).toBe("TechArticle");

      // Required string fields
      const stringFields = [
        "headline",
        "description",
        "datePublished",
        "url",
        "mainEntityOfPage",
      ] as const;
      for (const field of stringFields) {
        assertNonEmptyString(article![field], `${path}: ${field}`);
      }

      // headline matches the feature name exactly
      expect(article!.headline, `${path}: headline matches feature.name`).toBe(feature.name);

      // mainEntityOfPage self-references (ends with this feature slug)
      expect(
        (article!.mainEntityOfPage as string).endsWith(`/features/${feature.id}`),
        `${path}: mainEntityOfPage ends with /features/${feature.id}`,
      ).toBe(true);

      // author — must be a Person object with a non-empty name
      const author = article!.author;
      expect(author, `${path}: author present`).toBeDefined();
      expect(typeof author, `${path}: author is object`).toBe("object");
      expect((author as any)?.["@type"], `${path}: author.@type`).toBe("Person");
      assertNonEmptyString((author as any)?.name, `${path}: author.name`);

      // about — SoftwareApplication reference to Lovable
      const about = article!.about;
      expect(about, `${path}: about present`).toBeDefined();
      expect((about as any)?.["@type"], `${path}: about.@type`).toBe("SoftwareApplication");
      assertNonEmptyString((about as any)?.name, `${path}: about.name`);

      // speakable — SpeakableSpecification targeting #answer
      const speakable = article!.speakable;
      expect(speakable, `${path}: speakable present`).toBeDefined();
      expect((speakable as any)?.["@type"], `${path}: speakable.@type`).toBe(
        "SpeakableSpecification",
      );
      const selectors = (speakable as any)?.cssSelector;
      const selectorList: string[] = Array.isArray(selectors)
        ? selectors
        : [selectors].filter(Boolean);
      expect(selectorList.length, `${path}: speakable.cssSelector non-empty`).toBeGreaterThan(0);
      expect(selectorList, `${path}: speakable targets #answer`).toContain("#answer");
    },
    30_000,
  );
});
