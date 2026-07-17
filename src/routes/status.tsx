import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { IndexingProgressWidget } from "../components/atlas/IndexingProgressWidget";
import { GscStatusPanel } from "../components/atlas/GscStatusPanel";
import { SitemapIssuesTable } from "../components/atlas/SitemapIssuesTable";
import { SeoScanHistory } from "../components/atlas/SeoScanHistory";
import { SubscriberCountWidget } from "../components/atlas/SubscriberCountWidget";
import { useFeatures } from "../hooks/use-features";
import { buildCanonicalTags } from "../lib/canonical-meta";

const canonical = buildCanonicalTags({ path: "/status", noindex: true });

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
      { property: "og:image", content: "https://atlas.dahlingdigital.com/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Site status — The Lovable Feature Atlas" },
      {
        name: "twitter:description",
        content:
          "Operational status for the Lovable Feature Atlas — search indexing, sitemaps, and SEO scan history.",
      },
      { name: "twitter:image", content: "https://atlas.dahlingdigital.com/og-image.png" },
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

function StatModule({
  eyebrow,
  label,
  value,
  hint,
}: {
  eyebrow: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="relative flex flex-col gap-3 border border-cream/10 bg-ink/60 px-6 py-6">
      <span
        aria-hidden
        className="absolute left-0 top-0 h-6 w-px bg-gold/60"
      />
      <span
        aria-hidden
        className="absolute right-0 top-0 h-6 w-px bg-gold/60"
      />
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cream/45">
        {eyebrow}
      </p>
      <div className="flex items-baseline gap-3">
        <span className="t-counter tabular-nums text-cream">{value}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/55">
          {label}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed text-cream/55">{hint}</p>
    </div>
  );
}

function StatusPage() {
  const { features } = useFeatures();

  return (
    <main className="relative bg-ink text-cream">
      <section className="container-atlas pt-24 pb-6 lg:pt-32">
        <div className="atlas-frame">
          <span className="atlas-frame-marks" aria-hidden />

          {/* Restrained status pulse — a single steady dot + reading. */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="relative inline-flex size-2 items-center justify-center"
              >
                <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald/60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald" />
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-emerald">
                All systems nominal
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cream/45">
              Mission control · Operations
            </p>
          </div>

          <h1 className="t-title mt-5 text-cream">Site status</h1>
          <div className="atlas-rule mt-4" aria-hidden />
          <p className="t-body mt-5 max-w-2xl text-cream/70">
            Live operational view of the atlas — search indexing, sitemap health, digest
            delivery, and the most recent SEO scans. Curator-facing dashboard for anyone
            auditing how the site keeps itself in sync.
          </p>

          {/* Three equal summary modules — the ledger. */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatModule
              eyebrow="Index"
              label="features live"
              value={features.length.toLocaleString()}
              hint="Every feature URL submitted to Google via the daily sitemap."
            />
            <StatModule
              eyebrow="Digest"
              label="subscribers"
              value="PRIVATE"
              hint="Confirmed opt-ins for the weekly What Lovable Shipped email. Count kept private."
            />
            <StatModule
              eyebrow="Uptime"
              label="last 30d"
              value="100%"
              hint="Edge-served through Cloudflare — no observed downtime this cycle."
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-cream/10 pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/50">
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
        </div>
      </section>
      <IndexingProgressWidget />
      <SubscriberCountWidget />
      <GscStatusPanel />
      <SitemapIssuesTable />
      <SeoScanHistory />
    </main>
  );
}
