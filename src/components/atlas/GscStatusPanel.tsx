import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { getGscStatus, type GscStatus } from "../../lib/gsc.functions";

function StatusDot({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="size-4 text-emerald" aria-hidden />
  ) : (
    <XCircle className="size-4 text-[#C9665A]" aria-hidden />
  );
}

function Row({
  label,
  ok,
  children,
}: {
  label: string;
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-cream/10 py-3 first:border-t-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5">
          <StatusDot ok={ok} />
        </span>
        <div>
          <div className="t-label text-cream">{label}</div>
          <div className="t-meta mt-1 font-mono text-cream/60">{children}</div>
        </div>
      </div>
      <span
        className={`t-meta shrink-0 font-mono ${ok ? "text-emerald" : "text-[#C9665A]"}`}
      >
        {ok ? "OK" : "FAIL"}
      </span>
    </div>
  );
}

export function GscStatusPanel() {
  const fetchStatus = useServerFn(getGscStatus);

  const { data, isLoading, isFetching, refetch, error } = useQuery<GscStatus>({
    queryKey: ["gsc-status"],
    queryFn: () => fetchStatus(),
    staleTime: 60_000,
  });

  return (
    <section className="container-atlas section-y">
      <div className="rounded-lg border border-cream/10 bg-cream/[0.02] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="t-h3 text-cream">Search indexing status</h2>
            <p className="t-meta mt-1 text-cream/55">
              Live check of Google verification + sitemap submission for{" "}
              <span className="font-mono">lovable-feature-atlas.lovable.app</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="t-meta font-mono text-cream/60 underline-offset-4 hover:text-cream hover:underline disabled:opacity-50"
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-cream/60">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span className="t-meta font-mono">Checking Google Search Console…</span>
          </div>
        ) : error || !data ? (
          <div className="t-meta py-6 font-mono text-[#C9665A]">
            Could not reach Google Search Console.
          </div>
        ) : (
          <div className="divide-y divide-cream/10">
            <Row label="Site ownership verified" ok={data.verification.ok}>
              {data.verification.ok
                ? `Owner: ${data.verification.owners[0] ?? "unknown"}`
                : (data.verification.detail ?? "Not verified")}
            </Row>
            <Row label="Registered in Search Console" ok={data.site.ok}>
              {data.site.ok
                ? `Permission: ${data.site.permissionLevel ?? "—"}`
                : (data.site.detail ?? "Not registered")}
            </Row>
            <Row
              label="Sitemap submitted"
              ok={data.sitemap.ok && (data.sitemap.errors ?? 0) === 0}
            >
              {data.sitemap.ok ? (
                <>
                  Submitted{" "}
                  {data.sitemap.lastSubmitted
                    ? new Date(data.sitemap.lastSubmitted).toLocaleString()
                    : "—"}
                  {" · "}Fetched{" "}
                  {data.sitemap.lastDownloaded
                    ? new Date(data.sitemap.lastDownloaded).toLocaleString()
                    : "pending"}
                  {(data.sitemap.errors ?? 0) > 0 && ` · ${data.sitemap.errors} errors`}
                  {(data.sitemap.warnings ?? 0) > 0 &&
                    ` · ${data.sitemap.warnings} warnings`}
                </>
              ) : (
                (data.sitemap.detail ?? "Not submitted")
              )}
            </Row>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-cream/10 pt-3">
          <span className="t-meta font-mono text-cream/45">
            {data
              ? `Last checked ${new Date(data.checkedAt).toLocaleTimeString()}`
              : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
