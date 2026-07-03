/**
 * Asserts og:image and twitter:image resolve to /og-image.png on:
 *   /                    (home)
 *   /features/$slug      (first feature)
 *   /categories/$slug    (first category)
 * plus the root-level defaults in src/routes/__root.tsx.
 *
 * Live-site crawl — fetches rendered HTML.
 * Run: bunx vitest run tests/social-image-consistency.test.ts
 * Override target: SITE_ORIGIN=https://<other>.lovable.app bunx vitest run
 */
import { describe, it, expect } from "vitest";
import { features } from "../src/data/features";
import { allCategoryNames, categorySlug } from "../src/lib/categories";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const EXPECTED = `${SITE_ORIGIN}/og-image.png`;

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
    twitterImage: extract(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i),
  };
}

const firstFeatureSlug = features[0]?.id;
const firstCategorySlug = categorySlug(allCategoryNames()[0]);

const targets: Array<[label: string, path: string]> = [
  ["root (home)", "/"],
  ["home explicit", "/"],
  ["feature slug", `/features/${firstFeatureSlug}`],
  ["category slug", `/categories/${firstCategorySlug}`],
];

describe("social image consistency (/og-image.png)", () => {
  it("test targets resolved", () => {
    expect(firstFeatureSlug, "no features in dataset").toBeTruthy();
    expect(firstCategorySlug, "no categories derivable").toBeTruthy();
  });

  it.each(targets)("%s → og:image and twitter:image point to /og-image.png", async (_label, path) => {
    const meta = await fetchMeta(path);
    expect(meta.status, `${path} should respond 200`).toBe(200);
    expect(meta.ogImage, `${path}: og:image`).toBe(EXPECTED);
    expect(meta.twitterImage, `${path}: twitter:image`).toBe(EXPECTED);
  }, 30_000);
});
