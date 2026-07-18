import { describe, expect, it } from "vitest";
import {
  COMPLETE_CATALOG_GC_TIME,
  COMPLETE_CATALOG_QUERY_KEY,
  COMPLETE_CATALOG_STALE_TIME,
  completeCatalogQueryOptions,
} from "../src/lib/catalog-query";

describe("complete catalog query contract", () => {
  it("uses one stable key and the approved cache window", () => {
    expect(COMPLETE_CATALOG_QUERY_KEY).toEqual(["atlas-catalog", "cards", "complete"]);
    expect(completeCatalogQueryOptions.queryKey).toBe(COMPLETE_CATALOG_QUERY_KEY);
    expect(completeCatalogQueryOptions.staleTime).toBe(5 * 60 * 1000);
    expect(completeCatalogQueryOptions.gcTime).toBe(30 * 60 * 1000);
    expect(completeCatalogQueryOptions.refetchOnWindowFocus).toBe(false);
    expect(COMPLETE_CATALOG_STALE_TIME).toBe(5 * 60 * 1000);
    expect(COMPLETE_CATALOG_GC_TIME).toBe(30 * 60 * 1000);
  });
});
