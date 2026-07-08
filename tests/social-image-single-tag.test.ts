/**
 * Guards against duplicate social-image meta tags after moving og:image /
 * twitter:image out of __root.tsx into leaf routes. Each rendered page must
 * emit EXACTLY ONE og:image and EXACTLY ONE twitter:image tag.
 *
 * Live-site crawl. Run: bunx vitest run tests/social-image-single-tag.test.ts
 * Override target: SITE_ORIGIN=https://<other>.lovable.app bunx vitest run
 */
import { describe, it, expect } from "vitest";
import { features } from "../src/data/features";
import { allCategoryNames, categorySlug } from "../src/lib/categories";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;

function countMatches(html: string, re: RegExp): number {
  return Array.from(html.matchAll(re)).length;
}

async function fetchCounts(path: string) {
  const res = await fetch(`${SITE_ORIGIN}${path}`, { redirect: "follow" });
  const html = await res.text();
  return {
    status: res.status,
    ogImage: countMatches(
      html,
      /<meta[^>]+property=["']og:image["'][^>]+content=["'][^"']+["']/gi,
    ),
    twitterImage: countMatches(
      html,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["'][^"']+["']/gi,
    ),
  };
}

const firstFeatureSlug = features[0]?.id;
const firstCategorySlug = categorySlug(allCategoryNames()[0]);

const targets: Array<[label: string, path: string]> = [
  ["home", "/"],
  ["feature slug", `/features/${firstFeatureSlug}`],
  ["category slug", `/categories/${firstCategorySlug}`],
];

describe("social image meta uniqueness (no duplicates)", () => {
  it("targets resolved", () => {
    expect(firstFeatureSlug).toBeTruthy();
    expect(firstCategorySlug).toBeTruthy();
  });

  it.each(targets)(
    "%s renders exactly one og:image and one twitter:image",
    async (_label, path) => {
      const counts = await fetchCounts(path);
      expect(counts.status, `${path} should respond 200`).toBe(200);
      expect(counts.ogImage, `${path}: og:image count`).toBe(1);
      expect(counts.twitterImage, `${path}: twitter:image count`).toBe(1);
    },
    30_000,
  );
});
