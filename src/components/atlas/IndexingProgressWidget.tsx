import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, AlertTriangle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { getGscStatus, type GscStatus } from "../../lib/gsc.functions";

const STORAGE_KEY = "atlas:gsc:lastSeenCounts";
const GSC_SITE = "https://lovable-feature-atlas.lovable.app/";
const GSC_RESOURCE = encodeURIComponent(GSC_SITE);
const GSC_SITEMAP = encodeURIComponent(`${GSC_SITE}sitemap.xml`);
const GSC_LINKS = {
  sitemaps: `https://search.google.com/search-console/sitemaps?resource_id=${GSC_RESOURCE}`,
  sitemapDetail: `https://search.google.com/search-console/sitemaps?resource_id=${GSC_RESOURCE}&sitemap_url=${GSC_SITEMAP}`,
  pages: `https://search.google.com/search-console/index?resource_id=${GSC_RESOURCE}`,
} as const;

interface LastSeen {
  errors: number;
  warnings: number;
  lastDownloaded?: string;
}

function readLastSeen(): LastSeen | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LastSeen) : null;
  } catch {
    return null;
  }
}

function writeLastSeen(v: LastSeen) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

function formatRelative(iso?: string): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (Number.isNaN(then)) return "—";
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function IndexingProgressWidget() {
  const fetchStatus = useServerFn(getGscStatus);
  const [lastSeen, setLastSeen] = useState<LastSeen | null>(null);

  useEffect(() => {
    setLastSeen(readLastSeen());
  }, []);

  const { data, isLoading, error } = useQuery<GscStatus>({
    queryKey: ["gsc-status"],
    queryFn: () => fetchStatus(),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });

  const errors = data?.sitemap.errors ?? 0;
  const warnings = data?.sitemap.warnings ?? 0;
  const lastDownloaded = data?.sitemap.lastDownloaded;
  const lastSubmitted = data?.sitemap.lastSubmitted;

  const newErrors = lastSeen ? Math.max(0, errors - lastSeen.errors) : 0;
  const newWarnings = lastSeen ? Math.max(0, warnings - lastSeen.warnings) : 0;
  const freshlyCrawled =
    !!lastDownloaded && (!lastSeen?.lastDownloaded || lastDownloaded !== lastSeen.lastDownloaded);

  const acknowledge = () => {
    if (!data) return;
    const next: LastSeen = { errors, warnings, lastDownloaded };
    writeLastSeen(next);
    setLastSeen(next);
  };

  const hasNewIssues = newErrors > 0 || newWarnings > 0;
  const allClear = !isLoading && !error && data && errors === 0 && warnings === 0;

  return (
    <section className="container-atlas section-y">
      <div
        className={`rounded-lg border p-5 transition-colors ${
          hasNewIssues
            ? "border-[#C9665A]/40 bg-[#C9665A]/[0.04]"
            : freshlyCrawled
              ? "border-gold/40 bg-gold/[0.04]"
              : "border-cream/10 bg-cream/[0.02]"
        }`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-emerald" aria-hidden />
            <h2 className="t-h3 text-cream">Indexing progress</h2>
          </div>
          {(freshlyCrawled || hasNewIssues) && (
            <button
              type="button"
              onClick={acknowledge}
              className="t-meta rounded-md border border-cream/20 px-2.5 py-1 font-mono text-cream/70 transition-colors hover:border-cream/40 hover:text-cream"
            >
              Mark as seen
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-cream/60">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span className="t-meta font-mono">Checking Google…</span>
          </div>
        ) : error || !data ? (
          <div className="t-meta font-mono text-[#C9665A]">
            Could not reach Google Search Console.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Last crawled */}
            <div>
              <div className="t-meta font-mono uppercase tracking-wide text-cream/45">
                Last crawled by Google
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="t-h3 text-cream">{formatRelative(lastDownloaded)}</span>
                {freshlyCrawled && (
                  <span className="t-meta rounded-sm bg-gold/15 px-1.5 py-0.5 font-mono text-gold">
                    NEW
                  </span>
                )}
              </div>
              <div className="t-meta mt-1 font-mono text-cream/55">
                {lastDownloaded ? new Date(lastDownloaded).toLocaleString() : "Awaiting first fetch"}
              </div>
              <div className="t-meta mt-0.5 font-mono text-cream/40">
                Submitted {lastSubmitted ? formatRelative(lastSubmitted) : "—"}
              </div>
            </div>

            {/* Errors */}
            <div>
              <div className="t-meta font-mono uppercase tracking-wide text-cream/45">
                Errors
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span
                  className={`t-h3 ${errors > 0 ? "text-[#C9665A]" : "text-cream"}`}
                >
                  {errors}
                </span>
                {newErrors > 0 && (
                  <span className="t-meta inline-flex items-center gap-1 rounded-sm bg-[#C9665A]/15 px-1.5 py-0.5 font-mono text-[#C9665A]">
                    <AlertTriangle className="size-3" aria-hidden />+{newErrors} new
                  </span>
                )}
              </div>
              <div className="t-meta mt-1 font-mono text-cream/55">
                {errors === 0 ? "No errors reported" : "Reported by Google"}
              </div>
            </div>

            {/* Warnings */}
            <div>
              <div className="t-meta font-mono uppercase tracking-wide text-cream/45">
                Warnings
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span
                  className={`t-h3 ${warnings > 0 ? "text-gold" : "text-cream"}`}
                >
                  {warnings}
                </span>
                {newWarnings > 0 && (
                  <span className="t-meta inline-flex items-center gap-1 rounded-sm bg-gold/15 px-1.5 py-0.5 font-mono text-gold">
                    <AlertTriangle className="size-3" aria-hidden />+{newWarnings} new
                  </span>
                )}
              </div>
              <div className="t-meta mt-1 font-mono text-cream/55">
                {warnings === 0 ? "No warnings reported" : "Reported by Google"}
              </div>
            </div>
          </div>
        )}

        {allClear && (
          <div className="mt-4 flex items-center gap-2 border-t border-cream/10 pt-3 text-emerald">
            <CheckCircle2 className="size-4" aria-hidden />
            <span className="t-meta font-mono">Sitemap is clean — no errors or warnings.</span>
          </div>
        )}
      </div>
    </section>
  );
}
