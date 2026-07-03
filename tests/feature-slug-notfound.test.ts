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

      // Sitewide JSON-LD (Organization / WebSite) in __root.tsx is expected
      // and correct on every route including 404s. What must NOT appear is
      // any per-page / article-shaped schema attached to the missing feature.
      const ALLOWED_SITEWIDE_TYPES = new Set(["Organization", "WebSite", "Person"]);
      const FORBIDDEN_PAGE_TYPES = [
        "TechArticle",
        "Article",
        "NewsArticle",
        "BlogPosting",
        "Product",
        "CreativeWork",
      ];

      const jsonLdBlocks = Array.from(
        html.matchAll(
          /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
        ),
      ).map((m) => {
        try {
          return JSON.parse(m[1]);
        } catch {
          throw new Error(`invalid JSON-LD on /features/${slug}`);
        }
      });

      const collectTypes = (node: unknown, acc: string[] = []): string[] => {
        if (Array.isArray(node)) node.forEach((n) => collectTypes(n, acc));
        else if (node && typeof node === "object") {
          const rec = node as Record<string, unknown>;
          if (typeof rec["@type"] === "string") acc.push(rec["@type"]);
          if (Array.isArray(rec["@graph"])) rec["@graph"].forEach((n) => collectTypes(n, acc));
        }
        return acc;
      };

      const types = jsonLdBlocks.flatMap((b) => collectTypes(b));
      for (const t of types) {
        expect(
          FORBIDDEN_PAGE_TYPES.includes(t),
          `not-found page must not emit page/article JSON-LD; saw @type='${t}'`,
        ).toBe(false);
        expect(
          ALLOWED_SITEWIDE_TYPES.has(t),
          `unexpected JSON-LD @type on 404 page: '${t}' (allowed: ${[...ALLOWED_SITEWIDE_TYPES].join(", ")})`,
        ).toBe(true);
      }

      // Belt and suspenders: no raw TechArticle marker anywhere in the response.
      expect(html, "not-found page must not contain any TechArticle marker").not.toMatch(
        /TechArticle/,
      );

      // The dedicated notFoundComponent should render so users see a real page.
      expect(html, "not-found UI must render").toMatch(/feature not found/i);
    },
    20_000,
  );
});
