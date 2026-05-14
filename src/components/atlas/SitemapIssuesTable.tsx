import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  auditSitemap,
  type SitemapAuditResult,
  type SitemapIssue,
} from "../../lib/sitemap-audit.functions";

const TYPE_LABELS: Record<string, string> = {
  http_4xx: "HTTP 4xx (not found)",
  http_5xx: "HTTP 5xx (server error)",
  redirect: "Redirect",
  meta_noindex: "Noindex meta tag",
  canonical_mismatch: "Canonical mismatch",
  wrong_content_type: "Non-HTML content type",
  fetch_failed: "Fetch failed",
};

function severityChip(severity: SitemapIssue["severity"]) {
  if (severity === "error") {
    return (
      <span className="t-meta inline-flex items-center gap-1 rounded-sm bg-[#C9665A]/15 px-1.5 py-0.5 font-mono text-[#C9665A]">
        <XCircle className="size-3" aria-hidden />
        ERROR
      </span>
    );
  }
  return (
    <span className="t-meta inline-flex items-center gap-1 rounded-sm bg-gold/15 px-1.5 py-0.5 font-mono text-gold">
      <AlertTriangle className="size-3" aria-hidden />
      WARN
    </span>
  );
}

function IssueRow({ issue }: { issue: SitemapIssue }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        className="cursor-pointer border-t border-cream/10 hover:bg-cream/[0.03]"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="py-3 pl-3 pr-2 align-top">
          {open ? (
            <ChevronDown className="size-4 text-cream/50" aria-hidden />
          ) : (
            <ChevronRight className="size-4 text-cream/50" aria-hidden />
          )}
        </td>
        <td className="py-3 pr-3 align-top">{severityChip(issue.severity)}</td>
        <td className="py-3 pr-3 align-top">
          <div className="t-label text-cream">
            {TYPE_LABELS[issue.type] ?? issue.type}
          </div>
          <div className="t-meta mt-1 font-mono text-cream/55">
            {issue.description}
          </div>
        </td>
        <td className="py-3 pr-3 text-right align-top">
          <span className="t-h3 font-mono text-cream">{issue.count}</span>
        </td>
      </tr>
      {open && (
        <tr className="bg-cream/[0.02]">
          <td />
          <td colSpan={3} className="py-3 pr-3">
            <div className="t-meta mb-2 font-mono uppercase tracking-wide text-cream/45">
              Sample affected URLs ({Math.min(issue.sampleUrls.length, 5)} of {issue.count})
            </div>
            <ul className="space-y-1">
              {issue.sampleUrls.map((u) => (
                <li key={u}>
                  <a
                    href={u}
                    target="_blank"
                    rel="noreferrer"
                    className="t-meta break-all font-mono text-emerald underline-offset-4 hover:underline"
                  >
                    {u}
                  </a>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

export function SitemapIssuesTable() {
  const runAudit = useServerFn(auditSitemap);
  const { data, isLoading, isFetching, refetch, error } = useQuery<SitemapAuditResult>({
    queryKey: ["sitemap-audit"],
    queryFn: () => runAudit(),
    staleTime: 5 * 60_000,
  });

  return (
    <section className="container-atlas section-y">
      <div className="rounded-lg border border-cream/10 bg-cream/[0.02] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="t-h3 text-cream">Sitemap issues by type</h2>
            <p className="t-meta mt-1 text-cream/55">
              Live audit of every URL in <span className="font-mono">/sitemap.xml</span> — grouped by issue type, with sample affected URLs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="t-meta inline-flex items-center gap-2 rounded-md border border-emerald/40 px-3 py-1.5 font-mono text-emerald transition-colors hover:bg-emerald/10 disabled:opacity-50"
          >
            {isFetching ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-3.5" aria-hidden />
            )}
            Re-run audit
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-cream/60">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span className="t-meta font-mono">Auditing sitemap URLs…</span>
          </div>
        ) : error || !data ? (
          <div className="t-meta py-6 font-mono text-[#C9665A]">
            Could not run sitemap audit.
          </div>
        ) : data.fetchError ? (
          <div className="t-meta py-6 font-mono text-[#C9665A]">
            {data.fetchError}
          </div>
        ) : (
          <>
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="URLs scanned" value={data.totalUrls} />
              <Stat label="Clean" value={data.okUrls} tone="ok" />
              <Stat label="Errors" value={data.errorCount} tone={data.errorCount > 0 ? "error" : "neutral"} />
              <Stat label="Warnings" value={data.warningCount} tone={data.warningCount > 0 ? "warn" : "neutral"} />
            </div>

            {data.issues.length === 0 ? (
              <div className="t-meta py-6 font-mono text-emerald">
                No issues detected — every sitemap URL responds cleanly.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="t-meta font-mono uppercase tracking-wide text-cream/45">
                      <th className="w-8 py-2 pl-3" />
                      <th className="py-2 pr-3">Severity</th>
                      <th className="py-2 pr-3">Issue type</th>
                      <th className="py-2 pr-3 text-right">URLs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.issues.map((issue) => (
                      <IssueRow key={issue.type} issue={issue} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 border-t border-cream/10 pt-3">
              <span className="t-meta font-mono text-cream/45">
                Last audit {new Date(data.checkedAt).toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "ok" | "warn" | "error";
}) {
  const color =
    tone === "error"
      ? "text-[#C9665A]"
      : tone === "warn"
        ? "text-gold"
        : tone === "ok"
          ? "text-emerald"
          : "text-cream";
  return (
    <div className="rounded-md border border-cream/10 px-3 py-2">
      <div className="t-meta font-mono uppercase tracking-wide text-cream/45">
        {label}
      </div>
      <div className={`t-h3 font-mono ${color}`}>{value}</div>
    </div>
  );
}
