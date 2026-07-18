import { describe, expect, it } from "vitest";
import {
  HOME_CATALOG_SEARCH_DEFAULTS,
  requiresCompleteHomeCatalog,
  toCompleteHomeCatalogResult,
} from "../src/lib/home-catalog";
import type { CatalogCardsResult } from "../src/lib/features.functions";

describe("home catalog projection policy", () => {
  it("keeps only the exact default view on the narrow SSR projection", () => {
    expect(requiresCompleteHomeCatalog({ ...HOME_CATALOG_SEARCH_DEFAULTS })).toBe(false);

    const nonDefaultValues = {
      cat: "Editor",
      status: "ga",
      sort: "oldest",
      q: "payments",
      view: "timeline",
      recency: "30d",
      preset: "launch-ready",
    } satisfies Record<keyof typeof HOME_CATALOG_SEARCH_DEFAULTS, string>;

    for (const key of Object.keys(nonDefaultValues) as Array<keyof typeof nonDefaultValues>) {
      expect(
        requiresCompleteHomeCatalog({
          ...HOME_CATALOG_SEARCH_DEFAULTS,
          [key]: nonDefaultValues[key],
        }),
      ).toBe(true);
    }
  });

  it("constructs exact totals for a complete loader result", () => {
    const catalog: CatalogCardsResult = {
      features: [
        {
          id: "visual-edits",
          name: "Visual Edits",
          category: "Editor",
          status: "GA",
          releaseDate: "2026-01-02",
          pricing: "All plans",
          icon: "edit",
          tagline: "Edit directly on the canvas.",
        },
        {
          id: "payments",
          name: "Payments",
          category: "Commerce",
          status: "Beta",
          releaseDate: "2026-01-01",
          pricing: "Paid",
          icon: "credit-card",
          tagline: "Accept payments.",
        },
      ],
      generatedAt: "2026-01-03T12:00:00.000Z",
      source: "live",
    };

    expect(toCompleteHomeCatalogResult(catalog)).toEqual({
      ...catalog,
      total: 2,
      categoryCount: 2,
      gaCount: 1,
      isComplete: true,
    });
  });
});
