/**
 * Dedicated features sitemap — lists every /features/$slug URL.
 *
 * The main /sitemap.xml already expands this same set alongside the
 * apex and category pages; this file exists so search engines can also
 * fetch a features-only feed (useful for large catalogs and for cleanly
 * scoping crawl budget to the detail pages).
 */

import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { canonicalPath, canonicalUrl } from "../lib/canonical-meta";
import { features } from "../data/features";

export const Route = createFileRoute("/sitemap-features.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = new Date().toISOString().slice(0, 10);

        // De-dupe defensively — feature IDs should already be unique.
        const paths = new Set<string>();
        for (const f of features) {
          paths.add(canonicalPath(`/features/${f.id}`));
        }

        const urls = Array.from(paths)
          .sort((a, b) => a.localeCompare(b))
          .map((path) =>
            [
              `  <url>`,
              `    <loc>${canonicalUrl(path)}</loc>`,
              `    <lastmod>${lastmod}</lastmod>`,
              `    <changefreq>monthly</changefreq>`,
              `    <priority>0.6</priority>`,
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
