import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { routeTree } from "../routeTree.gen";
import { canonicalPath, canonicalUrl } from "../lib/canonical-meta";
import { features } from "../data/features";


// Routes to exclude from the sitemap (internal, non-indexable, dynamic params, splats).
// Compared post-canonicalization, so all entries here are already canonical paths.
const EXCLUDE_EXACT = new Set<string>(["/sitemap-preview", "/sitemap.xml", "/seo-audit"]);

function shouldInclude(rawPath: string): boolean {
  if (!rawPath || typeof rawPath !== "string") return false;
  if (!rawPath.startsWith("/")) return false;
  // Reject anything that isn't already a fully-resolved, query-free, fragment-free path.
  // Dynamic params ($id), splats (*), query strings, and fragments are all non-canonical.
  if (rawPath.includes("$") || rawPath.includes("*")) return false;
  if (rawPath.includes("?") || rawPath.includes("#")) return false;
  const path = canonicalPath(rawPath);
  if (EXCLUDE_EXACT.has(path)) return false;
  if (path.startsWith("/api/")) return false; // server endpoints
  if (path.startsWith("/lovable/")) return false;
  if (path === "/not-found") return false;
  return true;
}

function collectPaths(route: any, acc: Set<string>): void {
  const fp: unknown = route?.fullPath;
  if (typeof fp === "string" && shouldInclude(fp)) {
    // Store the canonical form so duplicates ("/about" vs "/about/") collapse.
    acc.add(canonicalPath(fp));
  }
  const kids = route?.children;
  if (kids) {
    const list = Array.isArray(kids) ? kids : Object.values(kids);
    for (const child of list) collectPaths(child, acc);
  }
}

interface SitemapEntry {
  path: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
}

function buildEntries(): SitemapEntry[] {
  const paths = new Set<string>();
  collectPaths(routeTree, paths);
  paths.add(canonicalPath("/")); // always include apex

  // Expand the dynamic /features/$slug route into one entry per feature.
  for (const f of features) {
    paths.add(canonicalPath(`/features/${f.id}`));
  }

  return Array.from(paths)
    .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)))
    .map((path) => ({
      path,
      changefreq: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? "1.0" : path.startsWith("/features/") ? "0.6" : "0.7",
    }));
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = buildEntries();
        const lastmod = new Date().toISOString().slice(0, 10);

        const urls = entries
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${canonicalUrl(e.path)}</loc>`,
              `    <lastmod>${lastmod}</lastmod>`,
              `    <changefreq>${e.changefreq}</changefreq>`,
              `    <priority>${e.priority}</priority>`,
              `  </url>`,
            ].join("\n"),
          )
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
