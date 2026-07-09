import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDigestStats } from "../../lib/digest.functions";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

export function SubscriberCountWidget() {
  const fetchStats = useServerFn(getDigestStats);
  const { data, isLoading } = useQuery({
    queryKey: ["digest-stats"],
    queryFn: () => fetchStats(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const confirmed = data?.confirmed ?? 0;
  const pending = data?.pending ?? 0;
  const lastSendAt = data?.lastSendAt ?? null;
  const lastRecipients = data?.lastRecipients ?? null;
  const senderReady = data?.senderReady ?? false;

  return (
    <section className="container-atlas py-8">
      <div className="border-t border-cream/10 pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald">Digest · What Lovable Shipped</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Confirmed" value={isLoading ? "—" : String(confirmed)} accent="emerald" />
          <Stat label="Pending" value={isLoading ? "—" : String(pending)} accent="gold" />
          <Stat label="Last send" value={fmtDate(lastSendAt)} accent="cream" />
          <Stat label="Last recipients" value={lastRecipients == null ? "—" : String(lastRecipients)} accent="cream" />
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/50">
          Sender status:{" "}
          <span className={senderReady ? "text-emerald" : "text-gold"}>
            {senderReady ? "domain verified · sending live" : "awaiting dahlingdigital.com verification · logging only"}
          </span>
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "emerald" | "gold" | "cream" }) {
  const color = accent === "emerald" ? "text-emerald" : accent === "gold" ? "text-gold" : "text-cream";
  return (
    <div className="rounded-md border border-cream/10 bg-cream/[0.02] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">{label}</div>
      <div className={`mt-2 font-mono text-lg tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
