import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { routeTree } from "../routeTree.gen";
import { canonicalPath, canonicalUrl } from "../lib/canonical-meta";
import { features as bundledFeatures } from "../data/features";
import { allCategoryNames, categorySlug } from "../lib/categories";
import { supabaseAdmin } from "../integrations/supabase/client.server";
import { listArchiveIdsForSitemap } from "../lib/digest-archive.server";

async function loadFeatureIds(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("features")
      .select("id")
      .limit(2000);
    if (error || !data || data.length === 0) {
      return bundledFeatures.map((f) => f.id);
    }
    return data.map((r) => r.id);
  } catch (err) {
    console.error("[sitemap] db read failed, using bundled fallback:", err);
    return bundledFeatures.map((f) => f.id);
  }
}



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
  if (path.startsWith("/.mcp/")) return false; // MCP infra routes
  if (path.startsWith("/.well-known/")) return false; // discovery endpoints
  if (path === "/mcp") return false; // MCP server endpoint
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

function buildEntries(featureIds: string[], archiveIds: string[]): SitemapEntry[] {
  const paths = new Set<string>();
  collectPaths(routeTree, paths);
  paths.add(canonicalPath("/")); // always include apex

  // Expand the dynamic /features/$slug route into one entry per feature.
  for (const id of featureIds) {
    paths.add(canonicalPath(`/features/${id}`));
  }

  // Expand the dynamic /categories/$slug route into one entry per category.
  for (const name of allCategoryNames()) {
    paths.add(canonicalPath(`/categories/${categorySlug(name)}`));
  }

  // Expand the dynamic /digest/$id archive route into one entry per past issue.
  paths.add(canonicalPath("/digest"));
  for (const id of archiveIds) {
    paths.add(canonicalPath(`/digest/${id}`));
  }

  return Array.from(paths)
    .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)))
    .map((path) => ({
      path,
      changefreq: path === "/" ? "weekly" : "monthly",
      priority:
        path === "/"
          ? "1.0"
          : path.startsWith("/features/")
            ? "0.6"
            : path.startsWith("/categories/")
              ? "0.7"
              : path.startsWith("/digest/")
                ? "0.5"
                : "0.7",
    }));
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [featureIds, archive] = await Promise.all([loadFeatureIds(), listArchiveIdsForSitemap()]);
        const entries = buildEntries(featureIds, archive.map((a) => a.id));
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
