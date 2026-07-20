import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, History, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { getSeoScans, runSelfSeoScan } from "../../lib/seo-scans.functions";

interface Finding {
  finding_id: string;
  name: string;
  category?: string | null;
  level?: string | null;
  state: string;
  description?: string | null;
}

interface ScanRow {
  id: string;
  ran_at: string;
  source: "chat" | "self_scan";
  url: string;
  failing_count: number;
  passing_count: number;
  ignored_count: number;
  findings: Finding[];
  summary: string | null;
}

const SITE_URL = "https://atlas.dahlingdigital.com";

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function diff(curr: ScanRow, prev: ScanRow | undefined) {
  if (!prev) return { added: [] as Finding[], resolved: [] as Finding[] };
  const prevIds = new Set(prev.findings.filter((f) => f.state === "failing").map((f) => f.finding_id));
  const currIds = new Set(curr.findings.filter((f) => f.state === "failing").map((f) => f.finding_id));
  const added = curr.findings.filter((f) => f.state === "failing" && !prevIds.has(f.finding_id));
  const resolved = prev.findings.filter(
    (f) => f.state === "failing" && !currIds.has(f.finding_id),
  );
  return { added, resolved };
}

export function SeoScanHistory() {
  const queryClient = useQueryClient();
  const fetchScans = useServerFn(getSeoScans);
  const runScan = useServerFn(runSelfSeoScan);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["seo-scans"],
    queryFn: () => fetchScans(),
    refetchInterval: 60_000,
  });

  const scans = useMemo<ScanRow[]>(() => (data?.scans ?? []) as unknown as ScanRow[], [data]);

  const [lastScanId, setLastScanId] = useState<string | null>(null);

  const scanMutation = useMutation({
    mutationFn: () => runScan({ data: { url: SITE_URL } }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["seo-scans"] });
      if (res.error) {
        toast.error("Self-scan failed", { description: res.error });
      } else {
        setLastScanId(res.id);
        setOpenId(res.id);
        toast.success("Scan complete", {
          description: `${res.failing} failing · ${res.passing} passing`,
        });
      }
    },
    onError: (e) => {
      toast.error("Could not run self-scan", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    },
  });

  return (
    <section className="container-atlas section-y">
      <div className="rounded-2xl border border-emerald/25 bg-ink/60 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-emerald/15 text-emerald">
              <History className="size-4" />
            </span>
            <div>
              <p className="t-eyebrow text-emerald">SEO history</p>
              <h2 className="t-h3 text-cream">Scan history &amp; diffs</h2>
              <p className="t-body-sm mt-1 text-cream/65">
                Snapshots of every recorded SEO scan. Self-scan runs lightweight in-app checks against the
                published page; chat snapshots come from the editor's SEO Review.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            className="t-label inline-flex items-center gap-2 rounded-md border border-emerald/40 bg-emerald/15 px-4 py-2 text-cream transition-colors hover:bg-emerald/25 disabled:opacity-60"
          >
            {scanMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4" />
            )}
            Run SEO scan
          </button>
        </div>

        {(() => {
          if (!lastScanId) return null;
          const idx = scans.findIndex((s) => s.id === lastScanId);
          if (idx < 0) return null;
          const d = diff(scans[idx], scans[idx + 1]);
          const hasPrev = !!scans[idx + 1];
          return (
            <div className="mt-5 rounded-xl border border-emerald/30 bg-emerald/5 p-4">
              <p className="t-eyebrow text-emerald">Latest scan · changes since previous</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 t-body-sm text-cream/85">
                {!hasPrev ? (
                  <span className="text-cream/65">First scan recorded — no prior snapshot to diff against.</span>
                ) : d.added.length === 0 && d.resolved.length === 0 ? (
                  <span className="text-cream/65">No changes since the previous scan.</span>
                ) : (
                  <>
                    <span className="text-danger">+{d.added.length} new failing</span>
                    <span className="text-emerald">−{d.resolved.length} resolved</span>
                    {d.added.slice(0, 3).map((f) => (
                      <span key={"a" + f.finding_id} className="t-meta rounded bg-danger/15 px-2 py-0.5 text-danger">
                        + {f.name}
                      </span>
                    ))}
                    {d.resolved.slice(0, 3).map((f) => (
                      <span key={"r" + f.finding_id} className="t-meta rounded bg-emerald/15 px-2 py-0.5 text-emerald">
                        − {f.name}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })()}

        <div className="mt-6 overflow-hidden rounded-xl border border-cream/10">
          {isLoading ? (
            <div className="flex items-center justify-center p-10 text-cream/60">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading history…
            </div>
          ) : scans.length === 0 ? (
            <div className="p-10 text-center text-cream/60 t-body-sm">
              No scans recorded yet. Click <em>Run self-scan</em> to capture the first snapshot.
            </div>
          ) : (
            <ul className="divide-y divide-cream/10">
              {scans.map((scan, i) => {
                const prev = scans[i + 1];
                const d = diff(scan, prev);
                const isOpen = openId === scan.id;
                return (
                  <li key={scan.id} className="bg-ink/40">
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : scan.id)}
                      className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-emerald/5"
                    >
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/55 w-32 shrink-0">
                        {fmtTime(scan.ran_at)}
                      </span>
                      <span
                        className={
                          "t-meta rounded-full px-2 py-0.5 " +
                          (scan.source === "self_scan"
                            ? "bg-emerald/15 text-emerald"
                            : "bg-gold/15 text-gold")
                        }
                      >
                        {scan.source === "self_scan" ? "Self-scan" : "Chat"}
                      </span>
                      <span className="t-meta text-danger">{scan.failing_count} failing</span>
                      <span className="t-meta text-cream/55">{scan.passing_count} passing</span>
                      {prev && (d.added.length > 0 || d.resolved.length > 0) ? (
                        <span className="t-meta ml-auto flex items-center gap-2">
                          {d.added.length > 0 && (
                            <span className="text-danger">+{d.added.length}</span>
                          )}
                          {d.resolved.length > 0 && (
                            <span className="text-emerald">−{d.resolved.length}</span>
                          )}
                        </span>
                      ) : (
                        <span className="ml-auto" />
                      )}
                      <ChevronDown
                        className={
                          "size-4 text-cream/55 transition-transform " + (isOpen ? "rotate-180" : "")
                        }
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-cream/10 bg-ink/60 px-4 py-4">
                        {scan.summary && (
                          <p className="t-body-sm mb-3 text-cream/70">{scan.summary}</p>
                        )}
                        {prev && (d.added.length > 0 || d.resolved.length > 0) && (
                          <div className="mb-4 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="t-eyebrow text-danger">New since previous</p>
                              {d.added.length === 0 ? (
                                <p className="t-meta mt-1 text-cream/45">None</p>
                              ) : (
                                <ul className="mt-1 space-y-1">
                                  {d.added.map((f) => (
                                    <li key={f.finding_id} className="t-meta text-cream/80">
                                      • {f.name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div>
                              <p className="t-eyebrow text-emerald">Resolved since previous</p>
                              {d.resolved.length === 0 ? (
                                <p className="t-meta mt-1 text-cream/45">None</p>
                              ) : (
                                <ul className="mt-1 space-y-1">
                                  {d.resolved.map((f) => (
                                    <li key={f.finding_id} className="t-meta text-cream/80">
                                      • {f.name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        )}
                        <p className="t-eyebrow text-cream/55">All findings</p>
                        {scan.findings.length === 0 ? (
                          <p className="t-meta mt-1 text-cream/45">No findings recorded.</p>
                        ) : (
                          <ul className="mt-2 space-y-1">
                            {scan.findings.map((f) => (
                              <li
                                key={f.finding_id}
                                className="t-meta flex items-baseline gap-2 text-cream/80"
                              >
                                <span
                                  className={
                                    "rounded px-1.5 py-0.5 text-[10px] font-mono uppercase " +
                                    (f.state === "failing"
                                      ? "bg-danger/15 text-danger"
                                      : "bg-emerald/15 text-emerald")
                                  }
                                >
                                  {f.state}
                                </span>
                                <span className="text-cream">{f.name}</span>
                                {f.description && (
                                  <span className="text-cream/55">— {f.description}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
