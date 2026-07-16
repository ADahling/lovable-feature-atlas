import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, RefreshCw, FileText } from "lucide-react";
import { buildCanonicalTags } from "../lib/canonical-meta";

// Noindex route: buildCanonicalTags({ noindex: true }) returns empty arrays,
// so canonical / og:url / twitter:url are intentionally NOT emitted here.
// A canonical on a noindex page sends mixed signals to crawlers.
const noCanonical = buildCanonicalTags({ path: "/sitemap-preview", noindex: true });

export const Route = createFileRoute("/sitemap-preview")({
  component: SitemapPreview,
  head: () => ({
    meta: [
      { title: "Sitemap preview — Lovable Feature Atlas" },
      {
        name: "description",
        content:
          "Internal preview of the Atlas sitemap — every URL the crawler is invited to visit, with lastmod, changefreq, and priority.",
      },
      { name: "robots", content: "noindex" },
      ...noCanonical.meta,
    ],
    links: [...noCanonical.links],
  }),
});

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

async function fetchSitemap(): Promise<{
  entries: SitemapEntry[];
  raw: string;
  fetchedAt: string;
}> {
  const res = await fetch("/sitemap.xml", { cache: "no-store" });
  if (!res.ok) throw new Error(`Sitemap returned ${res.status}`);
  const raw = await res.text();
  const doc = new DOMParser().parseFromString(raw, "application/xml");
  const urlNodes = Array.from(doc.getElementsByTagName("url"));
  const entries: SitemapEntry[] = urlNodes.map((u) => ({
    loc: u.getElementsByTagName("loc")[0]?.textContent ?? "",
    lastmod: u.getElementsByTagName("lastmod")[0]?.textContent ?? undefined,
    changefreq: u.getElementsByTagName("changefreq")[0]?.textContent ?? undefined,
    priority: u.getElementsByTagName("priority")[0]?.textContent ?? undefined,
  }));
  return { entries, raw, fetchedAt: new Date().toISOString() };
}

function SitemapPreview() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["sitemap-preview"],
    queryFn: fetchSitemap,
  });

  return (
    <main className="min-h-screen bg-ink text-cream">
      <section className="container-atlas section-y">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-emerald/20 pb-6">
            <div>
              <p className="t-eyebrow text-emerald">Pre-publish check</p>
              <h1 className="t-title mt-2 text-cream">Sitemap preview</h1>
              <p className="t-body-sm mt-2 max-w-2xl text-cream/70">
                URLs currently exposed in <code className="font-mono text-cream/90">/sitemap.xml</code>.
                Refresh after editing the sitemap to confirm the changes before publishing.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="t-label inline-flex items-center gap-2 rounded-md border border-emerald/30 px-3 py-2 text-cream/80 hover:border-emerald hover:text-cream"
              >
                <FileText className="size-3.5" aria-hidden /> Raw XML
                <ExternalLink className="size-3" aria-hidden />
              </a>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="t-label inline-flex items-center gap-2 rounded-md bg-emerald px-3 py-2 text-cream hover:bg-emerald-glow disabled:opacity-60"
              >
                <RefreshCw className={"size-3.5 " + (isFetching ? "animate-spin" : "")} aria-hidden />
                Refresh
              </button>
            </div>
          </div>

          {isLoading && <p className="t-body-sm text-cream/60">Loading sitemap…</p>}

          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              Could not load sitemap: {(error as Error).message}
            </div>
          )}

          {data && (
            <>
              <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-cream/60">
                <span>{data.entries.length} URL{data.entries.length === 1 ? "" : "s"}</span>
                <span>·</span>
                <span>Fetched {new Date(data.fetchedAt).toLocaleTimeString()}</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-emerald/20">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-emerald/10 font-mono text-[11px] uppercase tracking-wider text-cream/60">
                    <tr>
                      <th className="px-4 py-3">URL</th>
                      <th className="px-4 py-3">Changefreq</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Last modified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald/10">
                    {data.entries.map((e) => (
                      <tr key={e.loc} className="hover:bg-emerald/5">
                        <td className="px-4 py-3">
                          <a
                            href={e.loc}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-cream hover:text-emerald"
                          >
                            {e.loc}
                            <ExternalLink className="size-3" aria-hidden />
                          </a>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-cream/70">
                          {e.changefreq ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-cream/70">
                          {e.priority ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-cream/70">
                          {e.lastmod ?? "—"}
                        </td>
                      </tr>
                    ))}
                    {data.entries.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-cream/50">
                          Sitemap parsed, but it contains no &lt;url&gt; entries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <details className="rounded-lg border border-emerald/20 bg-ink/40">
                <summary className="cursor-pointer px-4 py-3 font-mono text-xs uppercase tracking-wider text-cream/70 hover:text-cream">
                  Raw XML
                </summary>
                <pre className="overflow-x-auto px-4 pb-4 font-mono text-xs text-cream/80">
{data.raw}
                </pre>
              </details>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
