import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { routeTree } from "../routeTree.gen";
import { canonicalPath, canonicalUrl } from "../lib/canonical-meta";
import { features as bundledFeatures } from "../data/features";
import { allCategoryNames, categorySlug } from "../lib/categories";
import { supabaseAdmin } from "../integrations/supabase/client.server";
import { listArchiveIdsForSitemap } from "../lib/digest-archive.server";

interface FeatureRow {
  id: string;
  release_date: string | null;
}

async function loadFeatureRows(): Promise<FeatureRow[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("features")
      .select("id,release_date")
      .limit(2000);
    if (error || !data || data.length === 0) {
      return bundledFeatures.map((f) => ({ id: f.id, release_date: f.releaseDate }));
    }
    return data.map((r) => ({
      id: r.id as string,
      release_date: (r.release_date as string | null) ?? null,
    }));
  } catch (err) {
    console.error("[sitemap] db read failed, using bundled fallback:", err);
    return bundledFeatures.map((f) => ({ id: f.id, release_date: f.releaseDate }));
  }
}



// Routes to exclude from the sitemap (internal, non-indexable, dynamic params, splats).
// Compared post-canonicalization, so all entries here are already canonical paths.
const EXCLUDE_EXACT = new Set<string>([
  "/sitemap-preview",
  "/sitemap.xml",
  "/sitemap-features.xml",
  "/seo-audit",
  "/status",
  "/admin/digest",
  "/digest/confirm",
  "/digest/unsubscribe",
  "/llms.txt",
  "/llms-full.txt",
]);

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
  lastmod: string;
}

/** Clamp to a valid YYYY-MM-DD no later than today; fall back when unparsable. */
function safeDate(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return fallback;
  const today = new Date().toISOString().slice(0, 10);
  const iso = d.toISOString().slice(0, 10);
  return iso > today ? today : iso;
}

function buildEntries(
  featureRows: FeatureRow[],
  archive: { id: string; sent_at: string }[],
): SitemapEntry[] {
  const paths = new Set<string>();
  collectPaths(routeTree, paths);
  paths.add(canonicalPath("/")); // always include apex

  // Real lastmod dates: features use their release date, digest issues their
  // send date, and catalog-driven pages the newest release date. A stable,
  // honest lastmod is trusted by crawlers; "today on every crawl" is not.
  const lastmodByPath = new Map<string, string>();
  const today = new Date().toISOString().slice(0, 10);
  const newestRelease = featureRows.reduce<string>(
    (max, r) => (safeDate(r.release_date, "0000-00-00") > max ? safeDate(r.release_date, max) : max),
    "2024-01-01",
  );

  // Expand the dynamic /features/$slug route into one entry per feature.
  for (const row of featureRows) {
    const p = canonicalPath(`/features/${row.id}`);
    paths.add(p);
    lastmodByPath.set(p, safeDate(row.release_date, newestRelease));
  }

  // Expand the dynamic /categories/$slug route into one entry per category.
  for (const name of allCategoryNames()) {
    paths.add(canonicalPath(`/categories/${categorySlug(name)}`));
  }

  // Expand the dynamic /digest/$id archive route into one entry per past issue.
  paths.add(canonicalPath("/digest"));
  for (const item of archive) {
    const p = canonicalPath(`/digest/${item.id}`);
    paths.add(p);
    lastmodByPath.set(p, safeDate(item.sent_at, today));
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
      // Catalog-driven pages (apex, categories, digest index, quiz, etc.)
      // inherit the newest release date — the moment their content last changed.
      lastmod: lastmodByPath.get(path) ?? newestRelease,
    }));
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [featureRows, archive] = await Promise.all([loadFeatureRows(), listArchiveIdsForSitemap()]);
        const entries = buildEntries(featureRows, archive);

        const urls = entries
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${canonicalUrl(e.path)}</loc>`,
              `    <lastmod>${e.lastmod}</lastmod>`,
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
