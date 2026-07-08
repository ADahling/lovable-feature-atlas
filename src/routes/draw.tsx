import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Download, RefreshCcw, Shuffle, Sparkles } from "lucide-react";
import { useFeatures } from "../hooks/use-features";
import type { Feature } from "../data/features";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { TarotCard, svgToPngUrl } from "../components/atlas/TarotCard";

export const Route = createFileRoute("/draw")({
  component: DrawPage,
  head: () => {
    const path = "/draw";
    const canonical = buildCanonicalTags({ path });
    const title = "Draw from the Atlas — a daily Lovable feature card";
    const description =
      "Draw an ornate tarot-style card from every Lovable feature. A new card daily, shareable as a high-res PNG. An editorial signature moment from The Lovable Feature Atlas.";
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

// ------- deterministic seed helpers -------

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function todayKey(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function pickIndex(features: Feature[], seed: number): number {
  if (features.length === 0) return 0;
  return seed % features.length;
}

// ------- fan geometry -------

const FAN_COUNT = 9;

function fanTransform(i: number, total: number, active: number | null) {
  const mid = (total - 1) / 2;
  const offset = i - mid;
  const angle = offset * 7; // degrees per card
  const x = offset * 46; // px
  const y = Math.abs(offset) * 8; // arch downward
  const isActive = active === i;
  return {
    rotate: angle,
    x,
    y: y + (isActive ? -30 : 0),
    scale: isActive ? 1.06 : 1,
    zIndex: isActive ? 30 : 10 + (10 - Math.abs(offset)),
  };
}

// ------- component -------

function DrawPage() {
  const { features } = useFeatures();
  const reduced = useReducedMotion() ?? false;
  const [mode, setMode] = useState<"today" | "random">("today");
  const [seed, setSeed] = useState(0);
  const [drawn, setDrawn] = useState<Feature | null>(null);
  const [drawnIndex, setDrawnIndex] = useState<number>(0);
  const [hover, setHover] = useState<number | null>(null);
  const [flipping, setFlipping] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Compute the fan sample. Reshuffle whenever seed changes.
  const fan = useMemo(() => {
    if (features.length === 0) return [] as Array<{ f: Feature; idx: number }>;
    const rng = mulberry32(seed || 1);
    const pool = features.slice();
    // Fisher-Yates using seeded rng
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(FAN_COUNT, pool.length)).map((f) => ({
      f,
      idx: features.indexOf(f) + 1,
    }));
  }, [features, seed]);

  // Initial draw: today's daily feature.
  useEffect(() => {
    if (features.length === 0) return;
    if (drawn) return;
    if (mode === "today") {
      const s = hashString(`atlas-${todayKey()}`);
      const i = pickIndex(features, s);
      setSeed(s);
      setDrawn(features[i]);
      setDrawnIndex(i + 1);
    }
  }, [features, mode, drawn]);

  const drawCard = useCallback(
    (feature: Feature, idx: number) => {
      if (reduced) {
        setDrawn(feature);
        setDrawnIndex(idx);
        return;
      }
      setFlipping(true);
      // brief flip window before revealing
      window.setTimeout(() => {
        setDrawn(feature);
        setDrawnIndex(idx);
        setFlipping(false);
      }, 380);
    },
    [reduced],
  );

  const reshuffleAndDraw = useCallback(() => {
    if (features.length === 0) return;
    const s = Math.floor(Math.random() * 2 ** 31);
    setSeed(s);
    setMode("random");
    const i = pickIndex(features, s);
    drawCard(features[i], i + 1);
  }, [features, drawCard]);

  const drawToday = useCallback(() => {
    if (features.length === 0) return;
    const s = hashString(`atlas-${todayKey()}`);
    setSeed(s);
    setMode("today");
    const i = pickIndex(features, s);
    drawCard(features[i], i + 1);
  }, [features, drawCard]);

  const handleFanPick = useCallback(
    (i: number) => {
      const entry = fan[i];
      if (!entry) return;
      drawCard(entry.f, entry.idx);
    },
    [fan, drawCard],
  );

  // Drag detection across the fan: identify which card is under pointer on release.
  const fanRef = useRef<HTMLDivElement | null>(null);
  const dragActive = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    dragActive.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragActive.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const card = el?.closest("[data-fan-card]") as HTMLElement | null;
    if (card) {
      const idx = Number(card.dataset.fanCard);
      if (!Number.isNaN(idx)) setHover(idx);
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragActive.current) return;
    dragActive.current = false;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const card = el?.closest("[data-fan-card]") as HTMLElement | null;
    if (card) {
      const idx = Number(card.dataset.fanCard);
      if (!Number.isNaN(idx)) handleFanPick(idx);
    }
    setHover(null);
  };

  async function downloadCard() {
    if (!svgRef.current || !drawn) return;
    try {
      const url = await svgToPngUrl(svgRef.current, 2);
      const a = document.createElement("a");
      a.href = url;
      a.download = `atlas-card-${drawn.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("[draw] download failed", err);
    }
  }

  const dateLabel = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-40 pt-12 sm:px-8 sm:pt-16">
      <div className="mb-8">
        <Link
          to="/"
          className="t-label inline-flex items-center gap-2 text-cream/60 transition-colors hover:text-emerald"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to the atlas
        </Link>
      </div>

      <header className="mb-10 flex flex-col gap-3">
        <p className="t-eyebrow text-emerald">Signature draw</p>
        <h1 className="t-title text-cream">Draw from the Atlas</h1>
        <p className="t-body max-w-2xl text-cream/70">
          A tarot-proportion card cut from every Lovable feature. One new card
          each day, or draw again at random. Take it as a nudge toward
          something you haven't shipped yet.
        </p>
      </header>

      {/* Drawn card stage */}
      <section
        aria-live="polite"
        className="relative mx-auto mb-10 flex w-full max-w-md flex-col items-center gap-5"
      >
        <div
          className="relative w-full"
          style={{ aspectRatio: "700 / 1225", perspective: 1600 }}
        >
          <AnimatePresence mode="wait">
            {drawn && (
              <motion.div
                key={drawn.id + (flipping ? "-flip" : "")}
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                initial={
                  reduced
                    ? { opacity: 0 }
                    : { rotateY: -180, y: -60, opacity: 0, scale: 0.9 }
                }
                animate={
                  reduced
                    ? { opacity: 1 }
                    : { rotateY: 0, y: 0, opacity: 1, scale: 1 }
                }
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                transition={
                  reduced
                    ? { duration: 0.25 }
                    : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                }
              >
                {/* Gold glow at flip apex */}
                {!reduced && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -inset-8 rounded-[40px]"
                    style={{
                      background:
                        "radial-gradient(closest-side, rgba(201,169,97,0.55), transparent 70%)",
                      filter: "blur(24px)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.9, times: [0, 0.5, 1] }}
                  />
                )}
                <TarotCard
                  ref={svgRef}
                  feature={drawn}
                  index={drawnIndex}
                  faceUp
                  className="h-full w-full drop-shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {drawn && (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/50">
              {mode === "today" ? `Today · ${dateLabel}` : "Random draw"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/features/$slug"
                params={{ slug: drawn.id }}
                className="inline-flex items-center gap-2 rounded-md border border-emerald/60 bg-emerald/10 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-emerald transition-colors hover:bg-emerald/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/70"
              >
                <Sparkles className="size-4" aria-hidden />
                Read the feature
              </Link>
              <button
                type="button"
                onClick={downloadCard}
                className="inline-flex items-center gap-2 rounded-md border border-gold/60 bg-gold/10 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              >
                <Download className="size-4" aria-hidden />
                Keep this card
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Fan of card backs */}
      <section aria-label="Draw a card from the fan" className="mb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/55">
            Tap or drag across a card
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={drawToday}
              className={
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors " +
                (mode === "today"
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-cream/15 text-cream/60 hover:border-cream/40 hover:text-cream")
              }
            >
              <RefreshCcw className="size-3.5" aria-hidden />
              Today's draw
            </button>
            <button
              type="button"
              onClick={reshuffleAndDraw}
              className={
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors " +
                (mode === "random"
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-cream/15 text-cream/60 hover:border-cream/40 hover:text-cream")
              }
            >
              <Shuffle className="size-3.5" aria-hidden />
              Draw again
            </button>
          </div>
        </div>

        <div
          ref={fanRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragActive.current = false;
            setHover(null);
          }}
          className="relative mx-auto flex h-[280px] w-full max-w-3xl touch-none items-end justify-center sm:h-[340px]"
          role="listbox"
          aria-label="Card fan"
        >
          {fan.map((entry, i) => {
            const t = fanTransform(i, fan.length, hover);
            return (
              <motion.button
                key={entry.f.id}
                data-fan-card={i}
                type="button"
                role="option"
                aria-selected={hover === i}
                aria-label={`Draw card ${i + 1} of ${fan.length}`}
                onFocus={() => setHover(i)}
                onBlur={() => setHover((h) => (h === i ? null : h))}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                onClick={() => handleFanPick(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleFanPick(i);
                  }
                }}
                className="absolute bottom-0 h-[260px] w-[150px] cursor-pointer rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 sm:h-[320px] sm:w-[185px]"
                style={{ zIndex: t.zIndex, transformOrigin: "bottom center" }}
                animate={{ rotate: t.rotate, x: t.x, y: t.y, scale: t.scale }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
              >
                <TarotCard
                  feature={entry.f}
                  index={entry.idx}
                  faceUp={false}
                  className="pointer-events-none h-full w-full drop-shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)]"
                />
              </motion.button>
            );
          })}
        </div>
      </section>

      <p className="mx-auto max-w-lg text-center font-mono text-[11px] uppercase tracking-[0.16em] text-cream/40">
        {features.length} cards in the deck · seed {seed.toString(16).slice(-6)}
      </p>
    </main>
  );
}

// Small seeded PRNG (mulberry32)
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
