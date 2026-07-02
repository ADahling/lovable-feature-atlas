/**
 * Snapshot the rendered <head> of a few representative /features/$slug pages
 * so any future change that (a) introduces a duplicate canonical, (b) leaks a
 * root-level tag that overrides a leaf tag, or (c) drifts a feature's title /
 * description / og:image will fail loudly instead of silently regressing SEO.
 *
 * The snapshot is a *normalized*, deterministic subset of head tags — not the
 * raw HTML — so cosmetic markup changes don't churn the snapshot.
 *
 * Run: `SITE_ORIGIN=http://localhost:8080 bunx vitest run tests/feature-head-snapshot.test.ts`
 * Update after an intentional change: append `-u` to the command.
 */

import { describe, it, expect } from "vitest";
import { features } from "../src/data/features";
import { canonicalUrl, SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;

// Three representative slugs — one very early GA, one mid-catalog, one recent.
// If any is removed from the dataset, swap it here.
const REPRESENTATIVE_SLUGS = ["agent-mode", "plan-mode", "gemini-3-pro"] as const;

interface HeadShape {
  title: string | null;
  description: string | null;
  robots: string | null;
  canonicalCount: number;
  canonical: string | null;
  og: Record<string, string>;
  twitter: Record<string, string>;
  jsonLdTypes: string[];
  techArticle: {
    "@context"?: unknown;
    "@type"?: unknown;
    headline?: unknown;
    url?: unknown;
    mainEntityOfPage?: unknown;
    datePublished?: unknown;
  } | null;
}

function extractHead(html: string): string {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : html;
}

function collect(head: string, attr: "property" | "name"): Record<string, string> {
  const out: Record<string, string> = {};
  const re = new RegExp(
    `<meta[^>]+${attr}=["']([^"']+)["'][^>]+content=["']([^"']*)["']|` +
      `<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']([^"']+)["']`,
    "gi",
  );
  for (const m of head.matchAll(re)) {
    const key = m[1] ?? m[4];
    const value = m[2] ?? m[3];
    if (!key) continue;
    // Duplicate keys collapse — but we assert canonicalCount separately for the
    // one place where duplicates actually matter.
    out[key] = value;
  }
  return out;
}

async function inspect(path: string): Promise<HeadShape> {
  const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
  expect(res.status, `${path} should 200`).toBe(200);
  const html = await res.text();
  const head = extractHead(html);

  const props = collect(head, "property");
  const names = collect(head, "name");

  const canonicalMatches = Array.from(
    head.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/gi),
  );

  const jsonLdBlocks = Array.from(
    head.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  )
    .map((m) => {
      try {
        return JSON.parse(m[1]);
      } catch {
        return null;
      }
    })
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object");

  const techArticle = jsonLdBlocks.find((b) => b["@type"] === "TechArticle") ?? null;

  const og: Record<string, string> = {};
  for (const [k, v] of Object.entries(props)) if (k.startsWith("og:")) og[k] = v;
  const tw: Record<string, string> = {};
  for (const [k, v] of Object.entries(names)) if (k.startsWith("twitter:")) tw[k] = v;

  return {
    title: (head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? null),
    description: names["description"] ?? null,
    robots: names["robots"] ?? null,
    canonicalCount: canonicalMatches.length,
    canonical: canonicalMatches[0]?.[1] ?? null,
    og,
    twitter: tw,
    jsonLdTypes: jsonLdBlocks.map((b) => String(b["@type"] ?? "")).sort(),
    techArticle: techArticle
      ? {
          "@context": techArticle["@context"],
          "@type": techArticle["@type"],
          headline: techArticle["headline"],
          url: techArticle["url"],
          mainEntityOfPage: techArticle["mainEntityOfPage"],
          datePublished: techArticle["datePublished"],
        }
      : null,
  };
}

describe("feature detail — head tag snapshots", () => {
  it.each(REPRESENTATIVE_SLUGS)(
    "%s matches snapshot and has no duplicate canonicals or root overrides",
    async (slug) => {
      const feature = features.find((f) => f.id === slug);
      expect(feature, `dataset must contain '${slug}' — update REPRESENTATIVE_SLUGS`).toBeDefined();

      const shape = await inspect(`/features/${slug}`);
      const expectedUrl = canonicalUrl(`/features/${slug}`);
      const expectedTitle = `${feature!.name} — Lovable Feature Atlas`;

      // Hard invariants — regressions here mean SEO drift, not cosmetic churn.
      expect(shape.canonicalCount, "exactly one <link rel=canonical>").toBe(1);
      expect(shape.canonical, "canonical self-references").toBe(expectedUrl);
      expect(shape.og["og:url"], "og:url self-references").toBe(expectedUrl);
      expect(shape.twitter["twitter:url"], "twitter:url self-references").toBe(expectedUrl);

      // Leaf tags must win over any root defaults.
      expect(shape.title, "title is feature-specific, not root default").toBe(expectedTitle);
      expect(shape.og["og:title"], "og:title matches leaf title").toBe(expectedTitle);
      expect(shape.og["og:type"], "og:type overrides root 'website'").toBe("article");
      expect(shape.twitter["twitter:title"], "twitter:title matches leaf").toBe(expectedTitle);
      expect(shape.description, "description is feature tagline").toBe(feature!.tagline);

      // TechArticle JSON-LD present alongside any sitewide blocks.
      expect(shape.jsonLdTypes, "TechArticle in JSON-LD types").toContain("TechArticle");
      expect(shape.techArticle?.headline, "TechArticle headline").toBe(feature!.name);
      expect(shape.techArticle?.url, "TechArticle url self-references").toBe(expectedUrl);
      expect(shape.techArticle?.mainEntityOfPage, "mainEntityOfPage self-references").toBe(
        expectedUrl,
      );

      // Full-shape snapshot — anything else that drifts (new tag, changed
      // og:image, extra JSON-LD block) shows up here on review.
      expect(shape).toMatchSnapshot();
    },
    30_000,
  );
});
