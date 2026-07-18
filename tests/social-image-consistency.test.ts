/**
 * Asserts og:image and twitter:image match the per-page expectation:
 *   /                    → /og-image.png
 *   /features/$slug      → /og/features/{slug}.png when the PNG exists on disk,
 *                          else fallback to /og-image.png
 *   /categories/$slug    → /og-image.png
 *
 * Live-site crawl — fetches rendered HTML.
 * Run: bunx vitest run tests/social-image-consistency.test.ts
 * Override target: SITE_ORIGIN=https://<other>.lovable.app bunx vitest run
 */
import { describe, it, expect } from "vitest";
import { readdirSync, existsSync } from "node:fs";
import { features } from "../src/data/features";
import { allCategoryNames, categorySlug } from "../src/lib/categories";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const SHARED_OG = `${DEFAULT_ORIGIN}/og-image.png`;

const FEATURE_OG_DIR = "public/og/features";
const featureOgSlugs = new Set<string>(
  existsSync(FEATURE_OG_DIR)
    ? readdirSync(FEATURE_OG_DIR)
        .filter((f) => f.endsWith(".png"))
        .map((f) => f.replace(/\.png$/, ""))
    : [],
);

function extract(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1] : null;
}

async function fetchMeta(path: string) {
  const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
  const html = await res.text();
  return {
    status: res.status,
    ogImage: extract(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i),
    twitterImage: extract(
      html,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    ),
  };
}

// Pick a feature that HAS a per-feature PNG, plus one that does NOT (fallback).
const featureWithImage = features.find((f) => featureOgSlugs.has(f.id));
const featureWithoutImage = features.find((f) => !featureOgSlugs.has(f.id));
const firstCategorySlug = categorySlug(allCategoryNames()[0]);

interface Target {
  label: string;
  path: string;
  expected: string;
}

const targets: Target[] = [
  { label: "root (home)", path: "/", expected: SHARED_OG },
  { label: "home explicit", path: "/", expected: SHARED_OG },
  { label: "category slug", path: `/categories/${firstCategorySlug}`, expected: SHARED_OG },
];

if (featureWithImage) {
  targets.push({
    label: "feature slug (has per-feature image)",
    path: `/features/${featureWithImage.id}`,
    expected: `${DEFAULT_ORIGIN}/og/features/${featureWithImage.id}.png`,
  });
}

if (featureWithoutImage) {
  targets.push({
    label: "feature slug (fallback to shared)",
    path: `/features/${featureWithoutImage.id}`,
    expected: SHARED_OG,
  });
}

describe("social image consistency (per-page og/twitter image)", () => {
  it("test targets resolved", () => {
    expect(features.length, "no features in dataset").toBeGreaterThan(0);
    expect(firstCategorySlug, "no categories derivable").toBeTruthy();
    expect(featureWithImage, "no feature has a per-feature OG png on disk").toBeTruthy();
    // featureWithoutImage may legitimately be undefined once every feature has
    // an image; only assert its target when present.
  });

  it.each(targets.map((t) => [t.label, t.path, t.expected] as const))(
    "%s → og:image and twitter:image match expected URL",
    async (_label, path, expected) => {
      const meta = await fetchMeta(path);
      expect(meta.status, `${path} should respond 200`).toBe(200);
      expect(meta.ogImage, `${path}: og:image`).toBe(expected);
      expect(meta.twitterImage, `${path}: twitter:image`).toBe(expected);
    },
    30_000,
  );
});
