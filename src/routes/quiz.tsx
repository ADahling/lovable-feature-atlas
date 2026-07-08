import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { useFeatures } from "../hooks/use-features";
import type { Feature } from "../data/features";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { tierForPercent, TIERS } from "../lib/tiers";
import { QuizResultCard } from "../components/atlas/QuizResultCard";
import { ShareBar } from "../components/atlas/ShareBar";

const STORAGE_KEY = "lfa.quiz.checked.v1";

const statusChipClass: Record<Feature["status"], string> = {
  GA: "border-emerald/40 text-emerald",
  Beta: "border-gold/40 text-gold",
  Removed: "border-cream/20 text-cream/50",
};

export const Route = createFileRoute("/quiz")({
  component: QuizPage,
  head: () => {
    const path = "/quiz";
    const canonical = buildCanonicalTags({ path });
    const title = "How many Lovable features have you used? — The Lovable Feature Atlas";
    const description =
      "Tick off every Lovable feature you've actually shipped with. Get a shareable card and your builder tier — from Tourist to Lovable Completionist.";
    const image = `${SITE_ORIGIN}/og-image.png`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        ...canonical.meta,
      ],
      links: canonical.links,
    };
  },
});

function loadChecked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveChecked(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* quota or private mode — silent */
  }
}

function QuizPage() {
  const { features } = useFeatures();
  const total = features.length;

  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hydrate from localStorage after mount (no SSR mismatch).
  useEffect(() => {
    setChecked(loadChecked());
    setHydrated(true);
  }, []);

  // Persist on every change (after initial hydration).
  useEffect(() => {
    if (!hydrated) return;
    saveChecked(checked);
  }, [checked, hydrated]);

  const count = checked.size;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const tier = tierForPercent(pct);

  const grouped = useMemo(() => {
    const byCat = new Map<string, Feature[]>();
    for (const f of features) {
      if (!byCat.has(f.category)) byCat.set(f.category, []);
      byCat.get(f.category)!.push(f);
    }
    return Array.from(byCat.entries())
      .map(([cat, list]) => ({
        category: cat,
        items: list.slice().sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [features]);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setChecked(new Set());
    setShowCard(false);
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `lovable-atlas-${count}-of-${total}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const shareUrl = canonicalUrl("/quiz");
  const shareHook = `${count}/${total} — ${tier.name}. How many have you used?`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-5 py-12 sm:px-8 sm:py-16">
      <div>
        <Link
          to="/"
          className="t-label inline-flex items-center gap-2 text-cream/60 transition-colors hover:text-emerald"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to the atlas
        </Link>
      </div>

      <header className="flex flex-col gap-4">
        <p className="t-eyebrow text-emerald">Self-assessment</p>
        <h1 className="t-title text-cream">
          How many Lovable features have you actually used?
        </h1>
        <p className="t-body max-w-2xl text-cream/70">
          Tick every feature you've genuinely shipped with. Your progress lives in this
          browser only — no account, no tracking. Generate a shareable card when you're done.
        </p>
      </header>

      {/* Sticky progress header */}
      <div
        className="sticky top-0 z-30 -mx-5 border-y border-cream/10 bg-ink/85 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-2xl text-cream">
              {count}
              <span className="text-cream/40"> of </span>
              {total}
            </span>
            <span className="font-mono text-sm text-cream/55">{pct}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
              {tier.name}
            </span>
            <button
              type="button"
              onClick={() => setShowCard(true)}
              disabled={count === 0}
              className="inline-flex items-center gap-2 rounded-md border border-gold/60 bg-gold/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Get my card
            </button>
            {count > 0 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/50 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40 rounded"
                aria-label="Reset progress"
              >
                <RotateCcw className="size-3" aria-hidden />
                Reset
              </button>
            )}
          </div>
        </div>
        {/* progress bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-cream/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald to-gold transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Result card modal-ish inline reveal */}
      {showCard && (
        <section
          className="flex flex-col gap-4 rounded-lg border border-gold/30 bg-ink p-5 sm:p-6"
          aria-label="Your shareable result card"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="t-card text-cream">Your card</h2>
            <button
              type="button"
              onClick={() => setShowCard(false)}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-cream/50 hover:text-cream"
            >
              Close
            </button>
          </div>
          <QuizResultCard
            count={count}
            total={total}
            tier={tier.name}
            onReady={(c) => {
              canvasRef.current = c;
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={downloadPng}
              className="inline-flex items-center gap-2 rounded-md border border-gold/60 bg-gold/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <Download className="size-4" aria-hidden />
              Download PNG
            </button>
            <ShareBar url={shareUrl} title="The Lovable Feature Atlas" hook={shareHook} />
          </div>
        </section>
      )}

      {/* Checklist grouped by category */}
      <div className="flex flex-col gap-10">
        {grouped.map(({ category, items }) => {
          const catChecked = items.filter((f) => checked.has(f.id)).length;
          return (
            <section key={category} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between border-b border-cream/10 pb-2">
                <h2 className="t-eyebrow text-emerald">{category}</h2>
                <span className="font-mono text-[11px] text-cream/50">
                  {catChecked}/{items.length}
                </span>
              </div>
              <ul className="flex flex-col divide-y divide-cream/8">
                {items.map((f) => {
                  const id = `q-${f.id}`;
                  const isChecked = checked.has(f.id);
                  return (
                    <li key={f.id}>
                      <label
                        htmlFor={id}
                        className="group flex cursor-pointer items-center gap-3 py-2.5 transition-colors hover:bg-emerald/5"
                      >
                        <input
                          id={id}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(f.id)}
                          className="peer size-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-cream/25 bg-transparent transition-colors checked:border-emerald checked:bg-emerald focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                        />
                        <span
                          aria-hidden
                          className="pointer-events-none -ml-7 size-4 shrink-0 opacity-0 peer-checked:opacity-100"
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%230A0A0A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='3.5 8.5 6.5 11.5 12.5 5'/></svg>\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                          }}
                        />
                        <span className="flex-1 text-cream/90 group-hover:text-cream">
                          {f.name}
                        </span>
                        <span
                          className={
                            "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] " +
                            statusChipClass[f.status]
                          }
                        >
                          {f.status}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Tier legend */}
      <aside className="rounded-lg border border-cream/10 bg-cream/[0.02] p-5">
        <p className="t-eyebrow text-emerald">Tiers</p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TIERS.map((t) => (
            <li
              key={t.name}
              className={
                "flex items-baseline justify-between rounded border px-3 py-2 " +
                (t.name === tier.name
                  ? "border-gold/60 bg-gold/5"
                  : "border-cream/10")
              }
            >
              <span
                className={
                  "font-mono text-[11px] uppercase tracking-[0.14em] " +
                  (t.name === tier.name ? "text-gold" : "text-cream/75")
                }
              >
                {t.name}
              </span>
              <span className="font-mono text-[11px] text-cream/50">
                {t.min}–{t.max}%
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
