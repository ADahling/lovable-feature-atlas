import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const featureRow = {
  id: "visual-edits",
  name: "Visual Edits",
  category: "Editor",
  status: "GA",
  release_date: "2026-01-02",
  pricing: "All plans",
  icon: "edit",
  tagline: "Edit a page directly on the canvas.",
  description: "A full feature description.",
  capabilities: ["Select elements", 42],
  use_cases: ["Landing pages"],
  source: "https://example.com/visual-edits",
  first_seen_at: "2026-01-02T00:00:00.000Z",
  source_url: null,
  updated_at: "2026-01-02T00:00:00.000Z",
};

function createSupabaseMock() {
  const featureResult = Promise.resolve({ data: [featureRow], error: null });
  const featureQuery = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };
  featureQuery.select.mockReturnValue(featureQuery);
  featureQuery.order.mockReturnValue(featureQuery);
  featureQuery.limit.mockReturnValue(featureResult);

  const scrapeResult = Promise.resolve({
    data: { finished_at: "2026-01-03T12:00:00.000Z" },
    error: null,
  });
  const scrapeQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
  };
  scrapeQuery.select.mockReturnValue(scrapeQuery);
  scrapeQuery.eq.mockReturnValue(scrapeQuery);
  scrapeQuery.order.mockReturnValue(scrapeQuery);
  scrapeQuery.limit.mockReturnValue(scrapeQuery);
  scrapeQuery.maybeSingle.mockReturnValue(scrapeResult);

  const from = vi.fn((table: string) => {
    if (table === "features") return featureQuery;
    if (table === "scrape_runs") return scrapeQuery;
    throw new Error(`Unexpected table: ${table}`);
  });

  return { from, supabaseAdmin: { from } };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.doUnmock("../src/integrations/supabase/client.server");
  vi.resetModules();
});

describe("catalog server gateway", () => {
  it("backs category-route SSR with the route-scoped catalog projection", () => {
    const routeSource = readFileSync(
      resolve(__dirname, "../src/routes/categories.$slug.tsx"),
      "utf8",
    );

    expect(routeSource).toContain("getCategoryCards({ data: { name: category } })");
    expect(routeSource).not.toContain("featuresInCategory");
  });

  it("coalesces live reads, caches them for five minutes, and projects narrow results", async () => {
    vi.stubEnv("ATLAS_FORCE_BUNDLED_FEATURES", "false");
    let now = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const supabase = createSupabaseMock();
    vi.doMock("../src/integrations/supabase/client.server", () => ({
      supabaseAdmin: supabase.supabaseAdmin,
    }));

    const catalog = await import("../src/lib/catalog.server");
    const [cards, home, summary, category, detail] = await Promise.all([
      catalog.getCatalogCards(),
      catalog.getHomeCatalog(),
      catalog.getCatalogSummary(),
      catalog.getCategoryCards("Editor"),
      catalog.getFeaturePageData("visual-edits"),
    ]);

    expect(supabase.from.mock.calls.filter(([table]) => table === "features")).toHaveLength(1);
    expect(cards).toEqual({
      features: [
        {
          id: "visual-edits",
          name: "Visual Edits",
          category: "Editor",
          status: "GA",
          releaseDate: "2026-01-02",
          pricing: "All plans",
          icon: "edit",
          tagline: "Edit a page directly on the canvas.",
        },
      ],
      generatedAt: "2026-01-03T12:00:00.000Z",
      source: "live",
    });
    expect(cards.features[0]).not.toHaveProperty("description");
    expect(home).toEqual({
      ...cards,
      total: 1,
      categoryCount: 1,
      gaCount: 1,
      isComplete: true,
    });
    expect(summary).toEqual({
      total: 1,
      categories: [{ name: "Editor", count: 1 }],
      statusCounts: { GA: 1, Beta: 0, Removed: 0 },
      generatedAt: "2026-01-03T12:00:00.000Z",
      source: "live",
    });
    expect(category.category).toBe("Editor");
    expect(category.features).toEqual(cards.features);
    expect(detail.feature).toMatchObject({
      id: "visual-edits",
      releaseDate: "2026-01-02",
      capabilities: ["Select elements"],
      useCases: ["Landing pages"],
    });
    expect(detail.categoryPeers).toEqual(cards.features);

    await catalog.getCatalogCards();
    expect(supabase.from.mock.calls.filter(([table]) => table === "features")).toHaveLength(1);

    now += catalog.CATALOG_TTL_MS + 1;
    await catalog.getCatalogCards();
    expect(supabase.from.mock.calls.filter(([table]) => table === "features")).toHaveLength(2);
  });

  it("uses the bundled catalog when ATLAS_FORCE_BUNDLED_FEATURES is true", async () => {
    vi.stubEnv("ATLAS_FORCE_BUNDLED_FEATURES", "true");
    const catalog = await import("../src/lib/catalog.server");

    const cards = await catalog.getCatalogCards();
    const summary = await catalog.getCatalogSummary();
    const first = cards.features[0];
    const detail = await catalog.getFeaturePageData(first.id);

    expect(cards.source).toBe("bundled");
    expect(cards.generatedAt).toBeNull();
    expect(cards.features.length).toBeGreaterThan(0);
    expect(summary).toMatchObject({
      total: cards.features.length,
      source: "bundled",
      generatedAt: null,
    });
    expect(detail.feature?.id).toBe(first.id);
    expect(detail.categoryPeers.every((peer) => peer.category === detail.feature?.category)).toBe(
      true,
    );
    expect(detail.source).toBe("bundled");
  });
});
