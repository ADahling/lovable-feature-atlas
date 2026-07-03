/**
 * Snapshot the rendered HTML structure (head + body) for representative
 * /features/$slug pages. Captures a normalized skeleton — tag names,
 * landmark roles, headings, and key attributes — not raw markup or
 * per-feature copy, so cosmetic edits don't churn the snapshot but
 * structural regressions (missing <main>, dropped <h1>, extra canonical,
 * lost back link, removed capabilities section) fail loudly.
 *
 * Run:    `bunx vitest run tests/feature-page-structure-snapshot.test.ts`
 * Update: append `-u` after an intentional structural change.
 */

import { describe, it, expect } from "vitest";
import { features } from "../src/data/features";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const REPRESENTATIVE_SLUGS = ["agent-mode", "plan-mode", "gemini-3-pro"] as const;

interface HeadShape {
  hasTitle: boolean;
  metaNames: string[];
  metaProperties: string[];
  canonicalCount: number;
  jsonLdTypes: string[];
}

interface BodyShape {
  landmarks: { main: number; nav: number; header: number; footer: number };
  headings: { h1: number; h2Count: number };
  hasBackLink: boolean;
  hasCapabilitiesHeading: boolean;
  hasUseCasesHeading: boolean;
  hasDocsLink: boolean;
  articleSectionCount: number;
}

function extract(html: string, re: RegExp): string[] {
  return Array.from(html.matchAll(re)).map((m) => m[1]);
}

function analyze(html: string): { head: HeadShape; body: BodyShape } {
  const headHtml = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  const bodyHtml = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;

  const metaNames = extract(headHtml, /<meta[^>]+name=["']([^"']+)["']/gi).sort();
  const metaProperties = extract(headHtml, /<meta[^>]+property=["']([^"']+)["']/gi).sort();
  const canonicalCount = extract(headHtml, /<link[^>]+rel=["'](canonical)["']/gi).length;
  const jsonLdTypes = Array.from(
    headHtml.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  )
    .map((m) => {
      try {
        const parsed = JSON.parse(m[1]);
        if (Array.isArray(parsed?.["@graph"])) {
          return parsed["@graph"].map((n: any) => String(n?.["@type"] ?? "")).join("+");
        }
        return String(parsed?.["@type"] ?? "");
      } catch {
        return "invalid";
      }
    })
    .sort();

  const h2s = extract(bodyHtml, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map((s) =>
    s.replace(/<[^>]+>/g, "").trim().toLowerCase(),
  );

  const body: BodyShape = {
    landmarks: {
      main: (bodyHtml.match(/<main\b/gi) ?? []).length,
      nav: (bodyHtml.match(/<nav\b/gi) ?? []).length,
      header: (bodyHtml.match(/<header\b/gi) ?? []).length,
      footer: (bodyHtml.match(/<footer\b/gi) ?? []).length,
    },
    headings: {
      h1: (bodyHtml.match(/<h1\b/gi) ?? []).length,
      h2Count: h2s.length,
    },
    hasBackLink: /back to the atlas/i.test(bodyHtml),
    hasCapabilitiesHeading: h2s.includes("capabilities"),
    hasUseCasesHeading: h2s.includes("use cases"),
    hasDocsLink: /docs\.lovable\.dev/i.test(bodyHtml),
    articleSectionCount: (bodyHtml.match(/<section\b/gi) ?? []).length,
  };

  return {
    head: { hasTitle: /<title[^>]*>[^<]+<\/title>/i.test(headHtml), metaNames, metaProperties, canonicalCount, jsonLdTypes },
    body,
  };
}

describe("feature detail — page structure snapshots", () => {
  it.each(REPRESENTATIVE_SLUGS)(
    "%s: rendered head + body structure matches snapshot",
    async (slug) => {
      const feature = features.find((f) => f.id === slug);
      expect(feature, `dataset must contain '${slug}'`).toBeDefined();

      const res = await fetch(`${SITE_ORIGIN}/features/${slug}`, { redirect: "follow" });
      expect(res.status, `/features/${slug} should 200`).toBe(200);
      const html = await res.text();
      const shape = analyze(html);

      // Hard invariants — kept out of the snapshot so they fail with clear messages.
      expect(shape.head.hasTitle, "has <title>").toBe(true);
      expect(shape.head.canonicalCount, "exactly one canonical").toBe(1);
      expect(shape.body.landmarks.main, "exactly one <main>").toBe(1);
      expect(shape.body.headings.h1, "exactly one <h1>").toBe(1);
      expect(shape.body.hasCapabilitiesHeading, "Capabilities section").toBe(true);
      expect(shape.body.hasUseCasesHeading, "Use cases section").toBe(true);
      expect(shape.body.hasBackLink, "back link present").toBe(true);
      expect(shape.body.hasDocsLink, "docs link present").toBe(true);

      expect(shape).toMatchSnapshot();
    },
    30_000,
  );
});
