import { afterAll, beforeAll, describe, expect, it } from "vitest";
import searchFeatures from "../src/lib/mcp/tools/search-features";
import getFeature from "../src/lib/mcp/tools/get-feature";
import listRecentLaunches from "../src/lib/mcp/tools/list-recent-launches";
import catalogStats from "../src/lib/mcp/tools/catalog-stats";

type ToolResult = {
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
};

type CallableTool = {
  handler: (input: Record<string, unknown>) => Promise<ToolResult>;
};

const previousForceBundled = process.env.ATLAS_FORCE_BUNDLED_FEATURES;

beforeAll(() => {
  process.env.ATLAS_FORCE_BUNDLED_FEATURES = "true";
});

afterAll(() => {
  if (previousForceBundled === undefined) delete process.env.ATLAS_FORCE_BUNDLED_FEATURES;
  else process.env.ATLAS_FORCE_BUNDLED_FEATURES = previousForceBundled;
});

async function invoke(tool: unknown, input: Record<string, unknown>) {
  return (tool as CallableTool).handler(input);
}

describe("public MCP tools", () => {
  it("searches the bundled fallback when public Supabase is unavailable", async () => {
    const result = await invoke(searchFeatures, { query: "MCP", limit: 3 });
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent?.count).toBe(3);
  });

  it("returns a full feature record by slug", async () => {
    const result = await invoke(getFeature, { id: "mapbox-connector" });
    expect(result.isError).not.toBe(true);
    expect((result.structuredContent?.feature as { name?: string }).name).toBe("Mapbox Connector");
  });

  it("lists the requested number of newest launches", async () => {
    const result = await invoke(listRecentLaunches, { limit: 3 });
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent?.count).toBe(3);
    const features = result.structuredContent?.features as Array<{ releaseDate: string }>;
    expect(features.map((feature) => feature.releaseDate)).toEqual(
      [...features].map((feature) => feature.releaseDate).sort((a, b) => b.localeCompare(a)),
    );
  });

  it("reports aggregate catalog statistics", async () => {
    const result = await invoke(catalogStats, {});
    expect(result.isError).not.toBe(true);
    expect(result.structuredContent?.total).toBeGreaterThan(300);
    expect(result.structuredContent?.site).toBe("https://atlas.dahlingdigital.com");
  });
});
