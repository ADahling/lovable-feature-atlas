/**
 * Static list of every category present in the atlas.
 * Kept here (rather than derived from src/data/features.ts) so client
 * modules that only need category metadata don't pull the 277 KB
 * feature dataset into their bundle. The daily catalog refresh job
 * asserts this list stays in sync via a unit test.
 */
const CATEGORY_NAMES = [
  "AI Models",
  "Agent",
  "App Connectors",
  "Cloud",
  "Community",
  "Deploy",
  "Editor",
  "Email",
  "Integrations",
  "MCP Connectors",
  "Mobile",
  "Platform",
  "Productivity",
  "Publishing",
  "Security",
  "Testing",
  "Workflow",
  "Workspace",
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

/** Slugify a category name into its URL segment. */
export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const allCategories: readonly string[] = [...CATEGORY_NAMES].sort();

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

/**
 * Server-only helper — features in a category, in original dataset order.
 * Imports the bundled dataset lazily so it never lands in a client chunk.
 */
export async function featuresInCategory(name: string) {
  const { features } = await import("../data/features");
  return features.filter((f) => f.category === name);
}
