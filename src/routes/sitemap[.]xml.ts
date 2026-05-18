import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { routeTree } from "../routeTree.gen";
import { canonicalUrl } from "../lib/canonical-meta";


// Routes to exclude from the sitemap (internal, non-indexable, dynamic params, splats)
const EXCLUDE_EXACT = new Set<string>(["/sitemap-preview", "/sitemap.xml"]);

function shouldInclude(path: string): boolean {
  if (!path || !path.startsWith("/")) return false;
  if (EXCLUDE_EXACT.has(path)) return false;
  if (path.startsWith("/api/")) return false; // server endpoints
  if (path.startsWith("/lovable/")) return false;
  if (path.includes("$") || path.includes("*")) return false; // unresolved params
  if (path === "/not-found") return false;
  return true;
}

function collectPaths(route: any, acc: Set<string>): void {
  const fp: unknown = route?.fullPath;
  if (typeof fp === "string" && shouldInclude(fp)) {
    // Normalize: drop trailing slash except for root
    const normalized = fp.length > 1 && fp.endsWith("/") ? fp.slice(0, -1) : fp;
    acc.add(normalized);
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
  paths.add("/"); // always include root

  return Array.from(paths)
    .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)))
    .map((path) => ({
      path,
      changefreq: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? "1.0" : "0.7",
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
              `    <loc>${BASE_URL}${e.path}</loc>`,
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
