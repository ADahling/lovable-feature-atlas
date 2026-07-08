import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

function LastSyncStamp() {
  // Client-only so SSR does not lock a stale timestamp into the payload.
  const [stamp, setStamp] = useState<string>("—");
  useEffect(() => {
    const update = () =>
      setStamp(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {stamp}
    </span>
  );
}

function StatusPage() {
  return (
    <main className="relative bg-ink text-cream">
      <section className="container-atlas pt-24 pb-6 lg:pt-32">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-block size-1.5 animate-pulse rounded-full bg-emerald"
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald">
            Mission control · Operations
          </p>
        </div>
        <h1 className="t-title mt-3 text-cream">Site status</h1>
        <div className="mt-4 h-px w-16 bg-cream/25" aria-hidden />
        <p className="t-body mt-4 max-w-2xl text-cream/70">
          Live operational view of the atlas — Google Search Console verification, sitemap
          submission, indexing progress, and the most recent SEO scans. This page is for the
          curator and anyone auditing how the site keeps itself in sync.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-cream/10 pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/50">
          <span className="inline-flex items-center gap-2">
            <span className="text-cream/40">Last sync</span>
            <LastSyncStamp />
            <span className="text-cream/30">local</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-cream/40">Env</span>
            <span className="tabular-nums text-cream/75">production</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-cream/40">Region</span>
            <span className="tabular-nums text-cream/75">global · edge</span>
          </span>
        </div>
      </section>
      <IndexingProgressWidget />
      <GscStatusPanel />
      <SitemapIssuesTable />
      <SeoScanHistory />
    </main>
  );
}
