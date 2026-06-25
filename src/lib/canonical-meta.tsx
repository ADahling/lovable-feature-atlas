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
 * Hosts we treat as aliases of SITE_ORIGIN. When an absolute URL with one of
 * these hosts gets passed in (preview deploys, the sandbox, localhost), we
 * reduce it to its pathname so the emitted tag still points at SITE_ORIGIN.
 * Foreign hosts are also reduced to pathname — we never echo an external
 * domain back into a canonical/og:url tag.
 */
const ALIAS_HOST_SUFFIXES: readonly string[] = [
  "lovable-feature-atlas.lovable.app",
  ".lovable.app", // preview / id-preview-- subdomains
  ".lovable.dev",
  "localhost",
  "127.0.0.1",
];

function isAliasHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  return ALIAS_HOST_SUFFIXES.some((s) =>
    s.startsWith(".") ? h.endsWith(s) || h === s.slice(1) : h === s,
  );
}

/**
 * Normalize a path into the single canonical form. Accepts absolute URLs,
 * protocol-relative URLs, or path-only strings. Always returns a path-only
 * value rooted at "/". Idempotent.
 *
 * Guards against accidental alias paths:
 *   - absolute / protocol-relative URLs → pathname only (host discarded)
 *   - query string + hash stripped
 *   - repeated slashes collapsed ("/a//b" → "/a/b")
 *   - "." and ".." segments resolved ("/a/./b" → "/a/b", "/a/../b" → "/b")
 *   - trailing slash dropped except apex "/"
 *   - leading "/" guaranteed
 */
export function canonicalPath(input: string): string {
  let raw = (input ?? "").trim();
  if (!raw) return "/";

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      void isAliasHost(u.host); // reserved for future dev-time warnings
      raw = `${u.pathname}${u.search}${u.hash}`;
    } catch {
      /* fall through to path-only handling */
    }
  }
  // Note: "//a/b" is treated as a path with repeated slashes (collapsed
  // below), not as a protocol-relative URL. Callers needing a true
  // protocol-relative input should pass the full "https://..." form.

  let p = raw.split("?")[0].split("#")[0];
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");

  const out: string[] = [];
  for (const seg of p.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      out.pop();
      continue;
    }
    out.push(seg);
  }
  p = "/" + out.join("/");

  if (p.length > 1 && p.endsWith("/")) p = p.replace(/\/+$/, "");
  return p;
}

/** Absolute canonical URL for a given path. Always rooted at SITE_ORIGIN.
 * Apex "/" returns SITE_ORIGIN with no trailing slash so canonical, og:url,
 * and the SEO debug panel's expected value all agree on one form. */
export function canonicalUrl(path: string): string {
  const p = canonicalPath(path);
  return p === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${p}`;
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
