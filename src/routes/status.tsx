import { createFileRoute, Link } from "@tanstack/react-router";
import { RadialMesh } from "../components/atlas/RadialMesh";
import { LovableHeart } from "../components/atlas/LovableHeart";
import { getRefreshRuns, type RunSummary } from "../lib/dataset.functions";

export const Route = createFileRoute("/status")({
  loader: () => getRefreshRuns(),
  component: StatusPage,
  head: () => ({
    meta: [
      { title: "Atlas refresh log — Lovable Feature Atlas" },
      {
        name: "description",
        content: "Daily refresh history for the Lovable Feature Atlas dataset.",
      },
    ],
  }),
});

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

function StatusPage() {
  const runs = (Route.useLoaderData() as RunSummary[]) ?? [];
  const latest = runs.slice().reverse().slice(0, 5);

  return (
    <main className="relative min-h-screen w-full bg-ink text-cream">
      <RadialMesh />
      <div className="mx-auto w-full max-w-[1100px] px-6 py-24 lg:px-12">
        <h1 className="font-sans text-[32px] font-semibold tracking-tight text-cream">
          Atlas refresh log
        </h1>
        <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.15em] text-cream/55">
          Last 5 cron runs · daily at 12:00 UTC
        </p>

        <div className="mt-10 overflow-x-auto rounded-xl border border-emerald/20">
          <table className="w-full border-collapse font-mono text-[12px]">
            <thead>
              <tr className="text-left text-cream/55 uppercase tracking-[0.15em]">
                <th className="px-4 py-3">Run</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Count</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3">Removed</th>
              </tr>
            </thead>
            <tbody>
              {latest.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-cream/50"
                  >
                    No runs recorded yet.
                  </td>
                </tr>
              )}
              {latest.map((r) => {
                const rowClass =
                  r.status === "failed"
                    ? "bg-[color:var(--lovable-pink-deep)]/15"
                    : r.status === "skipped-locked"
                      ? "text-cream/40"
                      : "";
                const statusColor =
                  r.status === "ok"
                    ? "text-emerald"
                    : r.status === "failed"
                      ? "text-cream"
                      : "text-cream/40";
                return (
                  <tr key={r.runId} className={"border-t border-emerald/15 " + rowClass}>
                    <td className="px-4 py-3 text-cream/80">{r.runId}</td>
                    <td className="px-4 py-3 text-cream/70">{fmtTime(r.startedAt)}</td>
                    <td className={"px-4 py-3 uppercase " + statusColor}>{r.status}</td>
                    <td className="px-4 py-3 text-cream/80">{r.count}</td>
                    <td className="px-4 py-3 text-cream/70">{r.addedIds.length}</td>
                    <td className="px-4 py-3 text-cream/70">{r.removedIds.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <LovableHeart className="size-5" />
          <Link
            to="/"
            className="font-mono text-[12px] uppercase tracking-[0.15em] text-cream/70 transition-colors hover:text-cream"
          >
            ← Atlas home
          </Link>
        </div>
      </div>
    </main>
  );
}
