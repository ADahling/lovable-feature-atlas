/**
 * Single source of truth for the canonical site origin and URL shape.
 *
 * Three responsibilities:
 *   1. `SITE_ORIGIN` / `canonicalPath()` / `canonicalUrl()` — anywhere we
 *      build an absolute or path-only URL (sitemap, JSON-LD, share links,
 *      GSC, OG tags) imports from here so trailing-slash / query-string
 *      drift is impossible.
 *   2. `buildCanonicalTags()` — emits the canonical / og:url / twitter:url
 *      triplet for a route's head(), and returns empty arrays for noindex
 *      routes (mixed signals to crawlers).
 *   3. `CanonicalLink` — drop-in TanStack `<Link>` wrapper that normalizes
 *      the `to` prop the same way before TanStack resolves it. Use this for
 *      ALL future internal navigation.
 *
 * Trailing-slash policy: the apex "/" keeps its slash; every other path is
 * stored WITHOUT a trailing slash. This matches the platform's 307 redirect
 * (`/foo/` → `/foo`) and our deployed canonical tags.
 */

import * as React from "react";
import { createLink, Link, type LinkComponent } from "@tanstack/react-router";

export const SITE_ORIGIN = "https://lovable-feature-atlas.lovable.app";

/**
 * Normalize a path: ensure leading "/", strip query + hash, collapse any
 * trailing slash (except for the root). Idempotent.
 */
export function canonicalPath(path: string): string {
  let p = path.split("?")[0].split("#")[0];
  if (!p.startsWith("/")) p = `/${p}`;
  // Collapse repeated internal slashes ("/a//b" -> "/a/b")
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1 && p.endsWith("/")) p = p.replace(/\/+$/, "");
  return p;
}

/** Absolute canonical URL for a given path. */
export function canonicalUrl(path: string): string {
  return `${SITE_ORIGIN}${canonicalPath(path)}`;
}

// ---------------------------------------------------------------------------
// Head tag builder
// ---------------------------------------------------------------------------

export interface CanonicalTagsInput {
  path: string;
  /** If true, emit nothing. Pair with a robots=noindex meta entry. */
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
  const href = canonicalUrl(path);
  return {
    meta: [
      { property: "og:url", content: href },
      { name: "twitter:url", content: href },
    ],
    links: [{ rel: "canonical", href }],
  };
}

// ---------------------------------------------------------------------------
// CanonicalLink — TanStack <Link> that normalizes its `to` prop
// ---------------------------------------------------------------------------

/**
 * Drop-in replacement for `<Link>` that runs the `to` prop through
 * `canonicalPath()` before TanStack resolves it. Strips accidental trailing
 * slashes ("/about/") and inline query strings ("/about?utm=x"). Use the
 * dedicated `search` prop for legitimate query params — those still flow
 * through normally.
 */
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const NormalizedAnchor = React.forwardRef<HTMLAnchorElement, AnchorProps>(
  (props, ref) => <a ref={ref} {...props} />,
);
NormalizedAnchor.displayName = "NormalizedAnchor";

const InternalLink = createLink(NormalizedAnchor);

export const CanonicalLink: LinkComponent<typeof NormalizedAnchor> = (
  props,
) => {
  const next: typeof props = { ...props };
  if (typeof next.to === "string") {
    // Only string `to` values can drift. TanStack also accepts route
    // objects / relative refs which are already type-safe.
    (next as { to: string }).to = canonicalPath(next.to);
  }
  return <InternalLink {...next} />;
};

// Re-export plain Link too so callers can choose; the lint rule below
// (see eslint config) nudges new code toward CanonicalLink.
export { Link };
