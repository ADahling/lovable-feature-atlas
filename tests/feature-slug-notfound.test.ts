/**
 * Requesting an unknown /features/$slug MUST return HTTP 404 and MUST NOT
 * render any schema JSON-LD (no <script type="application/ld+json">, and
 * specifically no TechArticle). Prevents regressions where a missing feature
 * silently 200s or emits stale/root schema attached to a non-existent page.
 *
 * Run: `bunx vitest run tests/feature-slug-notfound.test.ts`
 */

import { describe, it, expect } from "vitest";
import { features } from "../src/data/features";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;

// A handful of slugs guaranteed not to collide with the real dataset.
const UNKNOWN_SLUGS = [
  "definitely-not-a-real-feature-xyz",
  "zzz-missing-feature-9000",
  "totally-fake-slug-abcdef",
] as const;

describe("feature detail — unknown slug returns 404 with no schema JSON-LD", () => {
  it.each(UNKNOWN_SLUGS)(
    "%s: 404 status and no JSON-LD in the rendered HTML",
    async (slug) => {
      expect(
        features.find((f) => f.id === slug),
        `sentinel slug '${slug}' must not exist in the dataset`,
      ).toBeUndefined();

      const res = await fetch(`${SITE_ORIGIN}/features/${slug}`, { redirect: "manual" });
      expect(res.status, `unknown /features/${slug} must return 404`).toBe(404);

      const html = await res.text();

      const jsonLdBlocks = Array.from(
        html.matchAll(
          /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
        ),
      );
      expect(
        jsonLdBlocks.length,
        `not-found page must not render any JSON-LD blocks (found ${jsonLdBlocks.length})`,
      ).toBe(0);

      // Belt and suspenders: also assert no TechArticle marker leaked into the
      // page in any form (raw HTML, inline JS, attribute).
      expect(html, "not-found page must not contain any TechArticle schema marker").not.toMatch(
        /TechArticle/i,
      );

      // The dedicated notFoundComponent should render so users see a real page.
      expect(html, "not-found UI must render").toMatch(/feature not found/i);
    },
    20_000,
  );
});
