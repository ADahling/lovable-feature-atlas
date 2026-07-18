import { describe, expect, it, vi } from "vitest";
import { handleCatalogRequest, type CatalogApiLoaders } from "../src/routes/api/catalog";

function createLoaders(): CatalogApiLoaders {
  return {
    getCards: vi.fn(async () => ({
      features: [
        {
          id: "visual-edits",
          name: "Visual Edits",
          category: "Editor",
          status: "GA" as const,
          releaseDate: "2026-01-02",
          pricing: "All plans",
          icon: "edit",
          tagline: "Edit a page directly on the canvas.",
        },
      ],
      generatedAt: "2026-01-03T12:00:00.000Z",
      source: "live" as const,
    })),
    getSummary: vi.fn(async () => ({
      total: 1,
      categories: [{ name: "Editor", count: 1 }],
      statusCounts: { GA: 1, Beta: 0, Removed: 0 },
      generatedAt: "2026-01-03T12:00:00.000Z",
      source: "live" as const,
    })),
  };
}

describe("GET /api/catalog", () => {
  it("returns cards with public edge caching and honors If-None-Match", async () => {
    const loaders = createLoaders();
    const response = await handleCatalogRequest(
      new Request("https://atlas.example/api/catalog"),
      loaders,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
    expect(response.headers.get("cdn-cache-control")).toBe("public, max-age=300, must-revalidate");
    expect(await response.json()).toMatchObject({
      total: 1,
      source: "live",
      features: [{ id: "visual-edits" }],
    });

    const etag = response.headers.get("etag");
    expect(etag).toMatch(/^"[a-f0-9]{64}"$/);

    const notModified = await handleCatalogRequest(
      new Request("https://atlas.example/api/catalog", {
        headers: { "If-None-Match": `W/${etag}` },
      }),
      loaders,
    );
    expect(notModified.status).toBe(304);
    expect(notModified.body).toBeNull();
    expect(notModified.headers.get("etag")).toBe(etag);
  });

  it("returns only the summary projection for summary=1", async () => {
    const loaders = createLoaders();
    const response = await handleCatalogRequest(
      new Request("https://atlas.example/api/catalog?summary=1"),
      loaders,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      total: 1,
      categories: [{ name: "Editor", count: 1 }],
      statusCounts: { GA: 1, Beta: 0, Removed: 0 },
      generatedAt: "2026-01-03T12:00:00.000Z",
      source: "live",
    });
    expect(loaders.getSummary).toHaveBeenCalledOnce();
    expect(loaders.getCards).not.toHaveBeenCalled();
  });
});
