import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { useFeatures } from "../hooks/use-features";
import type { FeatureCard as Feature } from "../lib/features.functions";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { tierForPercent, TIERS } from "../lib/tiers";
import {
  QuizTarotCard,
  QUIZ_PORTRAIT,
  QUIZ_LANDSCAPE,
  type QuizCardOrientation,
} from "../components/atlas/QuizTarotCard";
import { svgToPngUrl } from "../lib/tarot-card";
import { QuizTick } from "../components/atlas/QuizTick";
import { QuizProgressPill } from "../components/atlas/QuizProgressPill";
import { QuizJumpNav } from "../components/atlas/QuizJumpNav";
import { CategorySpark } from "../components/atlas/CategorySpark";
import { ShareBar } from "../components/atlas/ShareBar";

const STORAGE_KEY = "lfa.quiz.checked.v1";

const statusChipClass: Record<Feature["status"], string> = {
  GA: "border-emerald/40 text-emerald",
  Beta: "border-gold/40 text-gold",
  Removed: "border-cream/20 text-cream/50",
};

function catSlug(name: string) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-");
}

export const Route = createFileRoute("/quiz")({
  component: QuizPage,
  head: () => {
    const path = "/quiz";
    const canonical = buildCanonicalTags({ path });
    const title = "Lovable Feature Quiz — How Many Have You Used?";
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
  const [orientation, setOrientation] = useState<QuizCardOrientation>("portrait");
  const [sparkCat, setSparkCat] = useState<string | null>(null);
  const prevCatComplete = useRef<Map<string, boolean>>(new Map());
  const svgRef = useRef<SVGSVGElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setChecked(loadChecked());
    setHydrated(true);
  }, []);

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
        slug: catSlug(cat),
        items: list.slice().sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [features]);

  const catStats = useMemo(
    () =>
      grouped.map((g) => ({
        slug: g.slug,
        category: g.category,
        total: g.items.length,
        checked: g.items.filter((f) => checked.has(f.id)).length,
      })),
    [grouped, checked],
  );

  // Detect category completion transitions → trigger a brief spark burst.
  // Skipped under prefers-reduced-motion.
  useEffect(() => {
    if (!hydrated) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const prev = prevCatComplete.current;
    for (const s of catStats) {
      const nowComplete = s.total > 0 && s.checked === s.total;
      const wasComplete = prev.get(s.slug) ?? false;
      if (nowComplete && !wasComplete) {
        setSparkCat(s.slug);
        window.setTimeout(() => {
          setSparkCat((cur) => (cur === s.slug ? null : cur));
        }, 750);
      }
      prev.set(s.slug, nowComplete);
    }
  }, [catStats, hydrated]);

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

  function openCard() {
    setShowCard(true);
    // scroll to card after mount
    requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function downloadPng() {
    if (!svgRef.current) return;
    try {
      const url = await svgToPngUrl(svgRef.current, 2);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lovable-atlas-${count}-of-${total}-${orientation}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("[quiz] card download failed", err);
    }
  }

  const shareUrl = canonicalUrl("/quiz");
  const shareHook = `${count}/${total} — ${tier.name}. How many have you used?`;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-56 pt-12 sm:px-8 sm:pb-32 sm:pt-16">
      {/* Sticky top progress bar — hairline gold rule that tracks completion.
          Intensifies with a soft gold glow as the count rises. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[3px] bg-cream/8"
      >
        <div
          className="h-full origin-left bg-gradient-to-r from-emerald via-emerald-glow to-gold transition-[width,box-shadow] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            boxShadow:
              pct > 0
                ? `0 0 ${6 + pct * 0.18}px rgba(201,169,97,${(0.25 + pct * 0.005).toFixed(3)}), 0 0 ${2 + pct * 0.06}px rgba(46,165,121,${(0.35 + pct * 0.003).toFixed(3)})`
                : "none",
          }}
        />
      </div>

      <div className="mb-8">
        <Link
          to="/"
          className="t-label inline-flex items-center gap-2 text-cream/60 transition-colors hover:text-emerald"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to the atlas
        </Link>
      </div>

      <header className="mb-12 grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,1fr)_160px]">
        <div className="flex flex-col gap-4">
          <p className="t-eyebrow text-emerald">Self-assessment</p>
          <h1 className="t-title text-cream">
            How many Lovable features have you actually used?
          </h1>
          <p className="t-body max-w-2xl text-cream/70">
            Tick every feature you've genuinely shipped with. Your progress lives in this
            browser only — no account, no tracking. Generate a shareable card when you're done.
          </p>
        </div>
        {/* Engraved radial completion seal. Reads the live count. */}
        <div className="justify-self-center md:justify-self-end">
          <div className="atlas-seal" role="img" aria-label={`${pct}% complete`}>
            <div className="flex flex-col items-center leading-none">
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold/80">
                Charted
              </span>
              <span className="mt-1 font-display text-[36px] font-semibold tabular-nums text-cream">
                {pct}
                <span className="ml-0.5 text-[16px] text-gold/80">%</span>
              </span>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-cream/55 tabular-nums">
                {count}/{total}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Result card inline reveal */}
      {showCard && (
        <section
          ref={cardRef}
          className="mb-12 flex flex-col gap-4 rounded-xl border border-gold/30 bg-ink p-5 sm:p-6"
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
          {/* Orientation toggle */}
          <div
            role="radiogroup"
            aria-label="Card orientation"
            className="flex items-center gap-2"
          >
            {(["portrait", "landscape"] as const).map((o) => {
              const active = orientation === o;
              const dims = o === "portrait" ? QUIZ_PORTRAIT : QUIZ_LANDSCAPE;
              return (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setOrientation(o)}
                  className={
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors " +
                    (active
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-cream/15 text-cream/60 hover:border-cream/40 hover:text-cream")
                  }
                >
                  {o === "portrait" ? "Portrait" : "Landscape"}
                  <span className="text-cream/40">{dims.w}×{dims.h}</span>
                </button>
              );
            })}
          </div>
          <div
            className={
              "mx-auto w-full " +
              (orientation === "portrait" ? "max-w-[420px]" : "max-w-[720px]")
            }
          >
            <QuizTarotCard
              ref={svgRef}
              count={count}
              total={total}
              tier={tier.name}
              orientation={orientation}
              className="h-auto w-full rounded-lg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
            />
          </div>
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

      {/* Two-column layout: jump nav + list */}
      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
        <QuizJumpNav cats={catStats} />

        <div className="flex flex-col gap-10">
          {grouped.map(({ category, slug, items }) => {
            const catChecked = items.filter((f) => checked.has(f.id)).length;
            return (
              <section
                key={slug}
                id={`cat-${slug}`}
                className="scroll-mt-24 flex flex-col gap-3"
              >
                <div className="relative flex items-baseline justify-between border-b border-cream/10 pb-2">
                  <h2 className="t-eyebrow text-emerald">{category}</h2>
                  <span className="font-mono text-[11px] text-cream/50">
                    {catChecked}/{items.length}
                  </span>
                  {sparkCat === slug && <CategorySpark />}
                </div>
                <ul className="flex flex-col divide-y divide-cream/8">
                  {items.map((f) => {
                    const id = `q-${f.id}`;
                    const isChecked = checked.has(f.id);
                    return (
                      <li key={f.id}>
                        <label
                          htmlFor={id}
                          className="group flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 transition-colors hover:bg-emerald/5"
                        >
                          <QuizTick
                            id={id}
                            checked={isChecked}
                            onChange={() => toggle(f.id)}
                            label={f.name}
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
        </div>
      </div>

      {/* Floating progress pill (always visible) */}
      <QuizProgressPill
        count={count}
        total={total}
        pct={pct}
        tier={tier.name}
        onGetCard={openCard}
        onReset={reset}
        disabled={count === 0}
      />
    </main>
  );
}
