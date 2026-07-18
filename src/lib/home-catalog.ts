import type { CatalogCardsResult, HomeCatalogResult } from "./features.functions";

export const HOME_CATALOG_SEARCH_DEFAULTS = {
  cat: "",
  status: "",
  sort: "newest",
  q: "",
  view: "grid",
  recency: "",
  preset: "",
} as const;

export type HomeCatalogSearch = {
  [Key in keyof typeof HOME_CATALOG_SEARCH_DEFAULTS]: string;
};

/** Any shareable, non-default catalog view must be truthful in its SSR HTML. */
export function requiresCompleteHomeCatalog(search: HomeCatalogSearch): boolean {
  return (Object.keys(HOME_CATALOG_SEARCH_DEFAULTS) as Array<keyof HomeCatalogSearch>).some(
    (key) => search[key] !== HOME_CATALOG_SEARCH_DEFAULTS[key],
  );
}

export function toCompleteHomeCatalogResult(catalog: CatalogCardsResult): HomeCatalogResult {
  return {
    ...catalog,
    total: catalog.features.length,
    categoryCount: new Set(catalog.features.map((feature) => feature.category)).size,
    gaCount: catalog.features.filter((feature) => feature.status === "GA").length,
    isComplete: true,
  };
}
