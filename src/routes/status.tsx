import { createFileRoute } from "@tanstack/react-router";
import { IndexingProgressWidget } from "../components/atlas/IndexingProgressWidget";
import { GscStatusPanel } from "../components/atlas/GscStatusPanel";
import { SitemapIssuesTable } from "../components/atlas/SitemapIssuesTable";
import { SeoScanHistory } from "../components/atlas/SeoScanHistory";
import { buildCanonicalTags } from "../lib/canonical-meta";

const canonical = buildCanonicalTags({ path: "/status" });

export const Route = createFileRoute("/status")({
  component: StatusPage,
  head: () => ({
    meta: [
      { title: "Site status — The Lovable Feature Atlas" },
      {
        name: "description",
        content:
          "Operational status for the Lovable Feature Atlas — Google Search Console verification, sitemap submission, indexing progress, and recent SEO scan history.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Site status — The Lovable Feature Atlas" },
      {
        property: "og:description",
        content:
          "Operational status for the Lovable Feature Atlas — search indexing, sitemaps, and SEO scan history.",
      },
      { property: "og:type", content: "website" },
      ...canonical.meta,
    ],
    links: canonical.links,
  }),
});

function StatusPage() {
  return (
    <main className="relative bg-ink text-cream">
      <section className="container-atlas pt-24 pb-6 lg:pt-32">
        <p className="t-eyebrow text-emerald">Operations</p>
        <h1 className="t-title mt-3 text-cream">Site status</h1>
        <p className="t-body mt-4 max-w-2xl text-cream/70">
          Live operational view of the atlas — Google Search Console verification, sitemap
          submission, indexing progress, and the most recent SEO scans. This page is for the
          curator and anyone auditing how the site keeps itself in sync.
        </p>
      </section>
      <IndexingProgressWidget />
      <GscStatusPanel />
      <SitemapIssuesTable />
      <SeoScanHistory />
    </main>
  );
}
