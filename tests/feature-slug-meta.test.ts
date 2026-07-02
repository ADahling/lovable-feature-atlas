/**
 * Live-site crawl test: every /features/$slug page renders feature-specific
 * metadata — title, description, canonical, og:url/title/description/type/image,
 * twitter:card/url/title/description/image, and TechArticle JSON-LD — that
 * matches the underlying feature record.
 *
 * Run: `bunx vitest run tests/feature-slug-meta.test.ts`
 * Override target host: `SITE_ORIGIN=https://<other>.lovable.app bunx vitest run`
 * Limit sample size: `FEATURE_SAMPLE=10 bunx vitest run tests/feature-slug-meta.test.ts`
 */

import { describe, it, expect } from "vitest";
import { features, type Feature } from "../src/data/features";
import { canonicalUrl, SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const SAMPLE = process.env.FEATURE_SAMPLE ? Number(process.env.FEATURE_SAMPLE) : 0;

function pickSample(list: Feature[], n: number): Feature[] {
  if (!n || n >= list.length) return list;
  // Deterministic stride sample so coverage spans the dataset.
  const stride = Math.floor(list.length / n);
  const out: Feature[] = [];
  for (let i = 0; i < list.length && out.length < n; i += stride) out.push(list[i]);
  return out;
}

function extractTag(html: string, pattern: RegExp): string | null {
  const m = html.match(pattern);
  return m ? m[1] : null;
}

function extractAll(html: string, pattern: RegExp): string[] {
  return Array.from(html.matchAll(pattern)).map((m) => m[1]);
}

interface PageMeta {
  status: number;
  html: string;
  title: string | null;
  description: string | null;
  canonical: string[];
  ogUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogType: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  twitterUrl: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  jsonLd: unknown[];
}

async function inspectPage(path: string): Promise<PageMeta> {
  const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
  const html = await res.text();
  const jsonLd = extractAll(
    html,
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )
    .map((s) => {
      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    })
    .filter((x): x is unknown => x !== null);

  return {
    status: res.status,
    html,
    title: extractTag(html, /<title[^>]*>([^<]*)<\/title>/i),
    description: extractTag(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i),
    canonical: extractAll(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/gi),
    ogUrl: extractTag(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i),
    ogTitle: extractTag(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i),
    ogDescription: extractTag(
      html,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    ),
    ogType: extractTag(html, /<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']+)["']/i),
    ogImage: extractTag(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i),
    twitterCard: extractTag(
      html,
      /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["']/i,
    ),
    twitterUrl: extractTag(html, /<meta[^>]+name=["']twitter:url["'][^>]+content=["']([^"']+)["']/i),
    twitterTitle: extractTag(
      html,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    ),
    twitterDescription: extractTag(
      html,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
    ),
    twitterImage: extractTag(
      html,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    ),
    jsonLd,
  };
}

const sample = pickSample(features, SAMPLE);

describe(`/features/$slug metadata — live site crawl (${sample.length} of ${features.length})`, () => {
  it("dataset has at least one feature", () => {
    expect(features.length).toBeGreaterThan(0);
  });

  it.each(sample.map((f) => [f.id, f] as const))(
    "%s renders feature-specific metadata",
    async (_slug, feature) => {
      const path = `/features/${feature.id}`;
      const expectedUrl = canonicalUrl(path);
      const expectedTitle = `${feature.name} — Lovable Feature Atlas`;
      const expectedDescription = feature.tagline;

      const meta = await inspectPage(path);

      expect(meta.status, `${path} should respond 200`).toBe(200);

      // Title + description
      expect(meta.title, `${path}: title`).toBe(expectedTitle);
      expect(meta.description, `${path}: description`).toBe(expectedDescription);

      // Canonical: exactly one, self-referencing
      expect(meta.canonical.length, `${path}: exactly one canonical`).toBe(1);
      expect(meta.canonical[0], `${path}: canonical URL`).toBe(expectedUrl);

      // OG tags
      expect(meta.ogUrl, `${path}: og:url`).toBe(expectedUrl);
      expect(meta.ogTitle, `${path}: og:title`).toBe(expectedTitle);
      expect(meta.ogDescription, `${path}: og:description`).toBe(expectedDescription);
      expect(meta.ogType, `${path}: og:type`).toBe("article");
      expect(meta.ogImage, `${path}: og:image must be absolute`).toMatch(/^https?:\/\//);

      // Twitter tags
      expect(meta.twitterCard, `${path}: twitter:card`).toBe("summary_large_image");
      expect(meta.twitterUrl, `${path}: twitter:url`).toBe(expectedUrl);
      expect(meta.twitterTitle, `${path}: twitter:title`).toBe(expectedTitle);
      expect(meta.twitterDescription, `${path}: twitter:description`).toBe(expectedDescription);
      expect(meta.twitterImage, `${path}: twitter:image must be absolute`).toMatch(/^https?:\/\//);

      // JSON-LD: TechArticle with feature-specific fields
      const article = meta.jsonLd.find(
        (j): j is Record<string, unknown> =>
          typeof j === "object" && j !== null && (j as Record<string, unknown>)["@type"] === "TechArticle",
      );
      expect(article, `${path}: TechArticle JSON-LD present`).toBeDefined();
      expect(article!.headline, `${path}: JSON-LD headline`).toBe(feature.name);
      expect(article!.description, `${path}: JSON-LD description`).toBe(feature.description);
      expect(article!.datePublished, `${path}: JSON-LD datePublished`).toBe(feature.releaseDate);
      expect(article!.url, `${path}: JSON-LD url`).toBe(expectedUrl);
      expect(article!.mainEntityOfPage, `${path}: JSON-LD mainEntityOfPage`).toBe(expectedUrl);
    },
    30_000,
  );

  it("unknown slug returns noindex not-found metadata", async () => {
    const meta = await inspectPage("/features/this-slug-does-not-exist-xyz");
    expect(meta.status).toBe(200); // TanStack renders notFoundComponent inline
    const robots = extractTag(
      meta.html,
      /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i,
    );
    expect(robots ?? "", "not-found must declare noindex").toMatch(/noindex/i);
    expect(meta.canonical.length, "not-found must NOT emit canonical").toBe(0);
  }, 30_000);

  it("mixed-case slug redirects to lowercase canonical", async () => {
    const first = features[0];
    const upper = first.id.toUpperCase();
    if (upper === first.id) return; // slug has no letters to change
    const res = await fetch(`${SITE_ORIGIN}/features/${upper}`, { redirect: "follow" });
    expect(res.status).toBe(200);
    expect(new URL(res.url).pathname).toBe(`/features/${first.id}`);
  }, 30_000);
});
