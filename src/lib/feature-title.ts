/**
 * Feature-page <title> builder. SEO guidance caps titles at ~60 characters,
 * so the " | Lovable Feature Atlas" suffix is dropped for long names and
 * very long names are ellipsized. Shared by the route head and the meta
 * tests so the contract has one source of truth.
 */
export const FEATURE_TITLE_SUFFIX = " | Lovable Feature Atlas";
export const FEATURE_TITLE_MAX = 60;

export function featurePageTitle(name: string): string {
  if (name.length + FEATURE_TITLE_SUFFIX.length <= FEATURE_TITLE_MAX) {
    return `${name}${FEATURE_TITLE_SUFFIX}`;
  }
  if (name.length <= FEATURE_TITLE_MAX) return name;
  return `${name.slice(0, FEATURE_TITLE_MAX - 3).trimEnd()}...`;
}
