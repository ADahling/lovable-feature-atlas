import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  CatalogCardsResult,
  CatalogSummaryResult,
  CategoryCardsResult,
  FeaturePageDataResult,
  HomeCatalogResult,
} from "@/lib/catalog.server";

export type {
  CatalogCardsResult,
  CatalogCategorySummary,
  CatalogSource,
  CatalogStatusCounts,
  CatalogSummaryResult,
  CategoryCardsResult,
  FeatureCard,
  FeaturePageDataResult,
  HomeCatalogResult,
} from "@/lib/catalog.server";

// Route-scoped public catalog loaders are safe to cache at the edge. Private
// and mutation-oriented routes never call this helper.
const DATA_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

async function setCatalogResponseCache(): Promise<void> {
  const { setResponseHeader } = await import("@tanstack/react-start/server");
  setResponseHeader("Cache-Control", DATA_CACHE);
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const featureIdSchema = z.object({
  id: z.string().min(1).max(120).regex(SLUG_PATTERN),
});
const categorySchema = z.object({
  name: z.string().trim().min(1).max(80),
});

/** Card projection for route-scoped public catalog loaders. */
export const getCatalogCards = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogCardsResult> => {
    await setCatalogResponseCache();
    const catalog = await import("@/lib/catalog.server");
    return catalog.getCatalogCards();
  },
);

/** Count and category projection for routes that do not need card records. */
export const getCatalogSummary = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogSummaryResult> => {
    await setCatalogResponseCache();
    const catalog = await import("@/lib/catalog.server");
    return catalog.getCatalogSummary();
  },
);

/** First homepage card page plus exact hero totals; never the full catalog. */
export const getHomeCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeCatalogResult> => {
    await setCatalogResponseCache();
    const catalog = await import("@/lib/catalog.server");
    return catalog.getHomeCatalog();
  },
);

/** Full record projection used only by a feature detail route. */
export const getFeaturePageData = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => featureIdSchema.parse(data))
  .handler(async ({ data }): Promise<FeaturePageDataResult> => {
    await setCatalogResponseCache();
    const catalog = await import("@/lib/catalog.server");
    return catalog.getFeaturePageData(data.id);
  });

/** Card projection limited to one canonical category name. */
export const getCategoryCards = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => categorySchema.parse(data))
  .handler(async ({ data }): Promise<CategoryCardsResult> => {
    await setCatalogResponseCache();
    const catalog = await import("@/lib/catalog.server");
    return catalog.getCategoryCards(data.name);
  });
