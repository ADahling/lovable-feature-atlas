import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/admin/digest")({
  head: () => ({
    meta: [
      { title: "Digest admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DigestAdmin,
});

interface LogRow {
  id: string;
  sent_at: string;
  recipient_count: number;
  feature_count: number;
  period_start: string;
  period_end: string;
  status: string;
  error: string | null;
  trigger: string;
}

interface LogResponse {
  ok: boolean;
  rows: LogRow[];
  summary: { total: number; ok: number; failed: number; partial: number; skipped: number };
  error?: string;
}

const TOKEN_KEY = "atlas.admin.token";

function parseErrorReason(raw: string | null): string {
  if (!raw) return "";
  const m = raw.match(/"type":"([^"]+)"/);
  if (m) return m[1];
  return raw.length > 120 ? raw.slice(0, 120) + "…" : raw;
}

function DigestAdmin() {
  const [token, setToken] = useState<string>("");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [data, setData] = useState<LogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [retrying, setRetrying] = useState<string | null>(null);
  const [flash, setFlash] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(TOKEN_KEY) ?? "";
    if (t) setToken(t);
  }, []);

  const load = async (t: string) => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/public/digest-log", { headers: { apikey: t } });
      if (res.status === 401) {
        setErr("Unauthorized — token rejected.");
        setData(null);
        return;
      }
      const json = (await res.json()) as LogResponse;
      if (!json.ok) {
        setErr(json.error ?? "Failed to load");
        return;
      }
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void load(token);
  }, [token]);

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

  const retry = async (row: LogRow) => {
    if (!token) return;
    setRetrying(row.id);
    setFlash("");
    try {
      let body: Record<string, unknown> = {};
      if (row.trigger === "preview") {
        const to = window.prompt("Send preview digest to which address?", "adahling@gmail.com");
        if (!to) { setRetrying(null); return; }
        body = { preview: true, to };
      }
      const res = await fetch("/api/public/digest-send", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: token },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setFlash(json.ok ? `Retry ${row.trigger === "preview" ? "preview" : "send"} succeeded.` : `Retry failed: ${json.error ?? res.status}`);
      await load(token);
    } catch (e) {
      setFlash(e instanceof Error ? e.message : String(e));
    } finally {
      setRetrying(null);
    }
  };

  const rows = data?.rows ?? [];
  const summary = data?.summary;

  const statusColor = useMemo(() => ({
    ok: "text-emerald-600 border-emerald-600/40 bg-emerald-500/5",
    failed: "text-red-600 border-red-600/40 bg-red-500/5",
    partial: "text-amber-600 border-amber-600/40 bg-amber-500/5",
    skipped: "text-muted-foreground border-border bg-muted/30",
  } as Record<string, string>), []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Admin</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Digest send log</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every attempt to send the "What Lovable Shipped" digest — cron and preview. Retry failed rows below.
        </p>
      </header>

      {!token ? (
        <div className="rounded-md border border-border bg-card p-6">
          <label className="block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Admin token
          </label>
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
            Stored in this browser's localStorage. Same value the cron uses to POST /api/public/digest-send.
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
              onClick={clearToken}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            >
              Sign out
            </button>
            {flash && <div className="ml-auto text-sm text-muted-foreground">{flash}</div>}
          </div>

          {err && <div className="mb-6 rounded-md border border-red-600/40 bg-red-500/5 p-4 text-sm text-red-700">{err}</div>}

          {summary && (
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { k: "Total", v: summary.total },
                { k: "OK", v: summary.ok },
                { k: "Failed", v: summary.failed },
                { k: "Partial", v: summary.partial },
                { k: "Skipped", v: summary.skipped },
              ].map((s) => (
                <div key={s.k} className="rounded-md border border-border bg-card p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.k}</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{s.v}</div>
                </div>
              ))}
            </div>
          )}

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Sent</th>
                  <th className="px-3 py-2">Trigger</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Period</th>
                  <th className="px-3 py-2 text-right">Recipients</th>
                  <th className="px-3 py-2 text-right">Features</th>
                  <th className="px-3 py-2">Error</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && !loading && (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">No digest send attempts logged yet.</td></tr>
                )}
                {rows.map((r) => {
                  const reason = parseErrorReason(r.error);
                  const canRetry = r.status === "failed" || r.status === "partial";
                  return (
                    <tr key={r.id} className="border-t border-border align-top">
                      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                        {new Date(r.sent_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">{r.trigger}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${statusColor[r.status] ?? "border-border text-muted-foreground"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{r.period_start} → {r.period_end}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.recipient_count}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.feature_count}</td>
                      <td className="px-3 py-2 text-xs">
                        {reason ? <span title={r.error ?? ""} className="font-mono">{reason}</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {canRetry ? (
                          <button
                            type="button"
                            onClick={() => void retry(r)}
                            disabled={retrying === r.id}
                            className="rounded-md border border-border bg-card px-2.5 py-1 text-xs hover:bg-muted disabled:opacity-50"
                          >
                            {retrying === r.id ? "Retrying…" : "Retry"}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
