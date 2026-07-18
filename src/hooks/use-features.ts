import { useQuery } from "@tanstack/react-query";
import { completeCatalogQueryOptions } from "../lib/catalog-query";
import type { CatalogCardsResult, FeatureCard } from "../lib/features.functions";

export interface UseFeaturesResult {
  features: FeatureCard[];
  generatedAt: string | null;
  source: "live" | "bundled";
  isComplete: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  retry: () => void;
}

export interface UseFeaturesOptions {
  initialData?: CatalogCardsResult;
  /** True when initialData contains the complete catalog, not a route projection. */
  initialDataComplete?: boolean;
  enabled?: boolean;
}

const EMPTY_CATALOG: CatalogCardsResult = {
  features: [],
  generatedAt: null,
  source: "bundled",
};

/**
 * Reads the complete card catalog through one shared query. Routes can pass a
 * narrow SSR projection for first paint, but projections remain observer-local
 * placeholder data and never contaminate the complete-catalog cache. Complete
 * route payloads seed that cache and avoid a duplicate hydration request.
 * No bundled catalog data enters the browser bundle and no root loader
 * serializes every card into every route.
 */
export function useFeatures(options: UseFeaturesOptions = {}): UseFeaturesResult {
  const completeInitialData = options.initialDataComplete ? options.initialData : undefined;
  const partialPlaceholderData = options.initialDataComplete ? undefined : options.initialData;
  const query = useQuery({
    ...completeCatalogQueryOptions,
    enabled: typeof window !== "undefined" && (options.enabled ?? true),
    initialData: completeInitialData,
    initialDataUpdatedAt: completeInitialData ? Date.now() : undefined,
    placeholderData: partialPlaceholderData,
  });
  const catalog = query.data ?? options.initialData ?? EMPTY_CATALOG;
  const isComplete =
    options.initialDataComplete === true ||
    (query.data !== undefined && query.isPlaceholderData === false);

  return {
    ...catalog,
    isComplete,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    retry: () => {
      void query.refetch();
    },
  };
}
