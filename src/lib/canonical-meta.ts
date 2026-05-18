/**
 * Centralized helper for canonical / og:url / twitter:url tags.
 *
 * Rule: these three tags must ONLY appear on indexable leaf routes.
 * Noindex routes (admin, drafts, previews) must omit them — emitting a
 * canonical on a noindex page sends mixed signals to crawlers.
 *
 * Usage in a route's head():
 *
 *   const tags = buildCanonicalTags({ path: "/about" });
 *   return { meta: [..., ...tags.meta], links: [...tags.links] };
 *
 * For a noindex route, either don't call this at all, or call with
 * `noindex: true` (returns empty arrays). Pair with a robots meta entry.
 */

export const SITE_ORIGIN = "https://lovable-feature-atlas.lovable.app";

export interface CanonicalTagsInput {
  /** Route path starting with "/". Trailing slashes and query strings are stripped. */
  path: string;
  /** If true, emit nothing. Use on routes that also set robots=noindex. */
  noindex?: boolean;
}

export interface CanonicalTagsOutput {
  meta: Array<{ property?: string; name?: string; content: string }>;
  links: Array<{ rel: string; href: string }>;
}

export function buildCanonicalTags({
  path,
  noindex = false,
}: CanonicalTagsInput): CanonicalTagsOutput {
  if (noindex) return { meta: [], links: [] };

  // Normalize: ensure leading slash, strip query/hash, collapse trailing slash
  // (except for the root "/").
  let normalized = path.split("?")[0].split("#")[0];
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.replace(/\/+$/, "");
  }

  const href = `${SITE_ORIGIN}${normalized}`;

  return {
    meta: [
      { property: "og:url", content: href },
      { name: "twitter:url", content: href },
    ],
    links: [{ rel: "canonical", href }],
  };
}
