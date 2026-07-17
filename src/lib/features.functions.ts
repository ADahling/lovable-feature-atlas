import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  CatalogCardsResult,
  CatalogSummaryResult,
  CategoryCardsResult,
  FeaturePageDataResult,
} from "@/lib/catalog.server";
import type { Feature } from "@/data/features";

export type {
  CatalogCardsResult,
  CatalogCategorySummary,
  CatalogSource,
  CatalogSummaryResult,
  CategoryCardsResult,
  FeatureCard,
  FeaturePageDataResult,
} from "@/lib/catalog.server";

// Public catalog pages are safe to cache at the edge. The legacy root loader
// deliberately does not call this helper because it also runs for private and
// mutation-oriented routes.
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

/**
 * Legacy root-loader contract. It intentionally omits cache headers because
 * the root loader runs for every route, including non-public routes.
 */
export const getFeatures = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogCardsResult> => {
    const catalog = await import("@/lib/catalog.server");
    return catalog.getCatalogCards();
  },
);

/** Legacy detail-loader contract retained while route consumers migrate. */
export const getFeatureById = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => featureIdSchema.parse(data))
  .handler(async ({ data }): Promise<{ feature: Feature | null }> => {
    await setCatalogResponseCache();
    const catalog = await import("@/lib/catalog.server");
    const { feature } = await catalog.getFeaturePageData(data.id);
    return { feature };
  });
