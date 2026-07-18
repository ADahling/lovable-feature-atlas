import { queryOptions } from "@tanstack/react-query";
import { getCatalogCards, type CatalogCardsResult } from "./features.functions";

export const COMPLETE_CATALOG_QUERY_KEY = ["atlas-catalog", "cards", "complete"] as const;
export const COMPLETE_CATALOG_STALE_TIME = 5 * 60 * 1000;
export const COMPLETE_CATALOG_GC_TIME = 30 * 60 * 1000;

/**
 * The only React Query cache entry for catalog cards. Data stored under this
 * key is always the complete card catalog; route projections stay observer-
 * local as placeholder data and never enter the shared cache.
 */
export const completeCatalogQueryOptions = queryOptions<CatalogCardsResult>({
  queryKey: COMPLETE_CATALOG_QUERY_KEY,
  queryFn: () => getCatalogCards(),
  staleTime: COMPLETE_CATALOG_STALE_TIME,
  gcTime: COMPLETE_CATALOG_GC_TIME,
  refetchOnWindowFocus: false,
});
