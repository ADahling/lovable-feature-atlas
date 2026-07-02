import { features, type Feature } from "../data/features";

/** Slugify a category name into its URL segment. */
export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const allCategories: string[] = Array.from(
  new Set(features.map((f) => f.category)),
).sort();

const bySlug = new Map<string, string>(
  allCategories.map((name) => [categorySlug(name), name]),
);

/** Resolve a URL slug back to its canonical category name, or undefined. */
export function categoryFromSlug(slug: string): string | undefined {
  return bySlug.get(slug);
}

/** Every category, sorted alphabetically. */
export function allCategoryNames(): readonly string[] {
  return allCategories;
}

/** Features in a category, in original dataset order. */
export function featuresInCategory(name: string): Feature[] {
  return features.filter((f) => f.category === name);
}
