import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { buildCanonicalTags, canonicalUrl } from "@/lib/canonical-meta";
import { auditRoutesSeo, type SeoAuditReport } from "@/lib/seo-audit.functions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadJson(report: SeoAuditReport) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadBlob(
    `seo-audit-${stamp}.json`,
    new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
  );
}

function downloadPdf(report: SeoAuditReport) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.setFontSize(18);
  doc.setTextColor(11, 61, 46);
  doc.text("SEO Audit Report", 40, 50);
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Generated ${report.ran_at}`, 40, 68);
  doc.text(
    `${report.summary.ok}/${report.summary.total} routes clean · ${report.summary.with_mismatches} with issues`,
    40,
    82,
  );
  if (report.sitemap_error) {
    doc.setTextColor(180, 90, 0);
    doc.text(`Sitemap error: ${report.sitemap_error}`, 40, 96);
    doc.setTextColor(80);
  } else {
    doc.text(`Sitemap: ${report.sitemap_urls.length} entries`, 40, 96);
  }

  autoTable(doc, {
    startY: 110,
    head: [["Route", "HTTP", "Sitemap", "Canonical", "Mismatches"]],
    body: report.routes.map((r) => [
      r.path,
      String(r.http_status || "—"),
      r.in_sitemap ? "in" : "missing",
      r.canonical ?? "—",
      r.mismatches.length ? r.mismatches.join("\n") : r.error ? `error: ${r.error}` : "ok",
    ]),
    styles: { fontSize: 8, cellPadding: 4, valign: "top" },
    headStyles: { fillColor: [11, 61, 46], textColor: 251 },
    columnStyles: {
      0: { cellWidth: 90, font: "courier" },
      1: { cellWidth: 40 },
      2: { cellWidth: 50 },
      3: { cellWidth: 180, font: "courier", fontSize: 7 },
      4: { cellWidth: "auto", textColor: [160, 80, 0] },
    },
  });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  doc.save(`seo-audit-${stamp}.pdf`);
}


const PATH = "/seo-audit";

export const Route = createFileRoute("/seo-audit")({
  component: SeoAuditPage,
  head: () => {
    const tags = buildCanonicalTags({ path: PATH });
    return {
      meta: [
        { title: "SEO Audit — Lovable Feature Atlas" },
        { name: "robots", content: "noindex,nofollow" },
        {
          name: "description",
          content:
            "On-demand audit of canonical, og:url, twitter:url, and sitemap coverage across every route.",
        },
        ...tags.meta,
      ],
      links: tags.links,
    };
  },
});

function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
        ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/40 bg-amber-500/10 text-amber-300"
      }`}
    >
      {ok ? "ok" : "issue"} {children}
    </span>
  );
}

function ReportView({ report }: { report: SeoAuditReport }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 font-mono text-xs text-zinc-300">
        <div>
          ran at <span className="text-zinc-100">{report.ran_at}</span>
        </div>
        <div>
          base <span className="text-zinc-100">{report.base_used}</span> · site
          origin <span className="text-zinc-100">{report.site_origin}</span>
        </div>
        <div>
          {report.summary.ok}/{report.summary.total} routes clean ·{" "}
          {report.summary.with_mismatches} with issues
        </div>
        {report.sitemap_error && (
          <div className="mt-2 text-amber-300">
            sitemap error: {report.sitemap_error}
          </div>
        )}
        <div className="mt-1 text-zinc-500">
          sitemap contains {report.sitemap_urls.length} URLs
        </div>
      </div>

      <div className="space-y-3">
        {report.routes.map((r) => {
          const ok = r.mismatches.length === 0 && !r.error;
          return (
            <div
              key={r.path}
              className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-zinc-100">{r.path}</span>
                <Pill ok={ok}>http {r.http_status || "—"}</Pill>
                <Pill ok={r.in_sitemap}>sitemap</Pill>
              </div>
              <div className="grid gap-1 font-mono text-[11px] text-zinc-400 md:grid-cols-2">
                <div>
                  expected:{" "}
                  <span className="text-zinc-200">{r.expected}</span>
                </div>
                <div>
                  fetched:{" "}
                  <span className="text-zinc-200">{r.fetched_url}</span>
                </div>
                <div>
                  canonical:{" "}
                  <span className="text-zinc-200">
                    {r.canonical ?? "— missing —"}
                  </span>
                </div>
                <div>
                  og:url:{" "}
                  <span className="text-zinc-200">
                    {r.og_url ?? "— missing —"}
                  </span>
                </div>
                <div>
                  twitter:url:{" "}
                  <span className="text-zinc-200">
                    {r.twitter_url ?? "— missing —"}
                  </span>
                </div>
              </div>
              {r.error && (
                <div className="mt-2 font-mono text-[11px] text-amber-300">
                  error: {r.error}
                </div>
              )}
              {r.mismatches.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-[11px] text-amber-300">
                  {r.mismatches.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeoAuditPage() {
  const runAudit = useServerFn(auditRoutesSeo);
  const mutation = useMutation<SeoAuditReport, Error>({ mutationFn: () => runAudit() });

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          internal · noindex
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-50">SEO audit</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Fetches every public route, parses{" "}
          <code className="font-mono">canonical</code>,{" "}
          <code className="font-mono">og:url</code>, and{" "}
          <code className="font-mono">twitter:url</code> from the rendered HTML,
          and verifies each matches{" "}
          <code className="font-mono">{canonicalUrl("/")}</code> and appears in{" "}
          <code className="font-mono">sitemap.xml</code>.
        </p>
      </header>

      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-50"
      >
        {mutation.isPending ? "Running…" : "Run audit"}
      </button>

      <div className="mt-8">
        {mutation.isError && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 font-mono text-xs text-red-200">
            {(mutation.error as Error)?.message ?? "Audit failed"}
          </div>
        )}
        {mutation.data && <ReportView report={mutation.data} />}
      </div>
    </main>
  );
}
