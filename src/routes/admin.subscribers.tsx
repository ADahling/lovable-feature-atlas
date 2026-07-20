import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/admin/subscribers")({
  head: () => ({
    meta: [
      { title: "Digest subscribers admin" },
      {
        name: "description",
        content: "Private admin console for the Atlas weekly digest subscribers — view, search, export, and purge test-domain rows.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SubscribersAdmin,
});

interface SubscriberRow {
  id: string;
  email: string;
  status: string;
  source: string | null;
  created_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  last_email_sent_at: string | null;
}

interface SuppressionRow {
  email: string;
  reason: string;
  source: string | null;
  note: string | null;
  created_at: string;
}

interface ListResponse {
  ok: boolean;
  rows: SubscriberRow[];
  summary: { total: number; confirmed: number; pending: number; unsubscribed: number; testDomain: number; suppressed: number };
  suppressions: SuppressionRow[];
  error?: string;
}


const TOKEN_KEY = "atlas.admin.token";
const TEST_PATTERN = "%@atlas-test.%";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }); }
  catch { return iso; }
}

function csvEscape(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function toCsv(rows: SubscriberRow[]): string {
  const header = ["email", "status", "source", "created_at", "confirmed_at", "unsubscribed_at", "last_email_sent_at"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([
      r.email,
      r.status,
      r.source ?? "",
      r.created_at,
      r.confirmed_at ?? "",
      r.unsubscribed_at ?? "",
      r.last_email_sent_at ?? "",
    ].map((v) => csvEscape(String(v))).join(","));
  }
  return lines.join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type StatusFilter = "all" | "confirmed" | "pending" | "unsubscribed";

function SubscribersAdmin() {
  const [token, setToken] = useState<string>("");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [flash, setFlash] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(TOKEN_KEY) ?? "";
    if (t) setToken(t);
  }, []);

  const load = async (t: string) => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/public/digest-subscribers", { headers: { apikey: t } });
      if (res.status === 401) {
        setErr("Unauthorized — token rejected.");
        setData(null);
        return;
      }
      const json = (await res.json()) as ListResponse;
      if (!json.ok) { setErr(json.error ?? "Failed to load"); return; }
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) void load(token); }, [token]);

  const saveToken = () => {
    if (!tokenInput.trim()) return;
    window.localStorage.setItem(TOKEN_KEY, tokenInput.trim());
    setToken(tokenInput.trim());
    setTokenInput("");
  };
  const clearToken = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setData(null);
  };

  const rows = data?.rows ?? [];
  const summary = data?.summary;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q && !r.email.toLowerCase().includes(q) && !(r.source ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, statusFilter]);

  const exportCurrent = () => {
    if (!filtered.length) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const scope = statusFilter === "all" ? "all" : statusFilter;
    downloadCsv(`digest-subscribers-${scope}-${stamp}.csv`, toCsv(filtered));
  };

  const purgeTestDomain = async () => {
    if (!token) return;
    const count = summary?.testDomain ?? 0;
    if (count === 0) {
      setFlash("Nothing to purge — no test-domain rows found.");
      return;
    }
    const confirmed = window.confirm(
      `Purge ${count} row(s) matching ${TEST_PATTERN}?\n\nThis permanently deletes every @atlas-test.* subscriber (confirmed and pending). This cannot be undone.`,
    );
    if (!confirmed) return;
    setPurging(true);
    setFlash("");
    try {
      const res = await fetch("/api/public/digest-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: token },
        body: JSON.stringify({ action: "purge", pattern: TEST_PATTERN }),
      });
      const json = await res.json();
      if (!json.ok) {
        setFlash(`Purge failed: ${json.error ?? res.status}`);
      } else {
        setFlash(`Purged ${json.purged} row(s) (${json.confirmed} confirmed, ${json.pending} pending).`);
        await load(token);
      }
    } catch (e) {
      setFlash(e instanceof Error ? e.message : String(e));
    } finally {
      setPurging(false);
    }
  };

  const statusColor: Record<string, string> = {
    confirmed: "text-emerald-600 border-emerald-600/40 bg-emerald-500/5",
    pending: "text-amber-600 border-amber-600/40 bg-amber-500/5",
    unsubscribed: "text-muted-foreground border-border bg-muted/30",
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Admin</div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-cream">Digest subscribers</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every row in digest_subscribers. Search by email or source, filter by status, export the current view as CSV, and purge test-domain rows.
        </p>
      </header>

      {!token ? (
        <div className="rounded-md border border-border bg-card p-6">
          <label className="block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Admin token</label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveToken(); }}
              placeholder="REFRESH_TOKEN"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={saveToken}
              className="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Unlock
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Same REFRESH_TOKEN as /admin/digest. Stored in this browser's localStorage only.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void load(token)}
              disabled={loading}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={exportCurrent}
              disabled={!filtered.length}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              Export {filtered.length} as CSV
            </button>
            <button
              type="button"
              onClick={purgeTestDomain}
              disabled={purging || !(summary?.testDomain ?? 0)}
              className="rounded-md border border-red-600/50 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-500/20 disabled:opacity-50"
              title={`Delete all rows matching ${TEST_PATTERN}`}
            >
              {purging ? "Purging…" : `Purge test-domain (${summary?.testDomain ?? 0})`}
            </button>
            <button
              type="button"
              onClick={clearToken}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              Sign out
            </button>
            {flash && <div className="ml-auto text-sm text-muted-foreground">{flash}</div>}
          </div>

          {err && <div className="mb-6 rounded-md border border-red-600/40 bg-red-500/5 p-4 text-sm text-red-700">{err}</div>}

          {summary && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { k: "Total", v: summary.total, f: "all" as StatusFilter },
                { k: "Confirmed", v: summary.confirmed, f: "confirmed" as StatusFilter },
                { k: "Pending", v: summary.pending, f: "pending" as StatusFilter },
                { k: "Unsubscribed", v: summary.unsubscribed, f: "unsubscribed" as StatusFilter },
                { k: "Test domain", v: summary.testDomain, f: "all" as StatusFilter },
              ].map((s) => {
                const active = statusFilter === s.f && s.k !== "Test domain";
                return (
                  <button
                    key={s.k}
                    type="button"
                    onClick={() => {
                      if (s.k === "Test domain") { setQuery("@atlas-test."); setStatusFilter("all"); }
                      else setStatusFilter(s.f);
                    }}
                    className={`rounded-md border p-3 text-left transition-colors ${active ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"}`}
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.k}</div>
                    <div className="mt-1 text-2xl font-semibold tabular-nums">{s.v}</div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email or source…"
              className="w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="flex gap-1 rounded-md border border-border bg-card p-1 text-xs">
              {(["all", "confirmed", "pending", "unsubscribed"] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`rounded px-2.5 py-1 font-mono uppercase tracking-wider ${statusFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="ml-auto text-xs text-muted-foreground tabular-nums">
              Showing {filtered.length} of {rows.length}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Signed up</th>
                  <th className="px-3 py-2">Confirmed</th>
                  <th className="px-3 py-2">Last sent</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">No subscribers match this view.</td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-3 py-2 font-mono text-xs">{r.email}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${statusColor[r.status] ?? "border-border text-muted-foreground"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{r.source ?? "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{fmt(r.created_at)}</td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{fmt(r.confirmed_at)}</td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{fmt(r.last_email_sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
