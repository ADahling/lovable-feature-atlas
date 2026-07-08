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

// ------- fan geometry -------

const FAN_COUNT = 9;
const CARD_W = 150; // matches the base fan card width
const CARD_W_SM = 185;

interface FanTransform {
  rotate: number;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  opacity: number;
}

/**
 * Fan geometry driven by three inputs:
 *  - `active`: which card the pointer/keyboard is over (extra lift + slight untilt)
 *  - `drag`:   pointer offset relative to the fan center in [-1, 1] on x
 *              — cards spread further and tilt into the drag direction so the
 *              deck feels physical before a pick.
 *  - `parting`: when true, the whole fan spreads and dims to make room for
 *              the ceremonial draw traveling up the stage.
 */
function fanTransform(
  i: number,
  total: number,
  active: number | null,
  drag: number,
  parting: boolean,
  chosen: number | null,
): FanTransform {
  const mid = (total - 1) / 2;
  const offset = i - mid;
  const spread = parting ? 1.55 : 1 + Math.abs(drag) * 0.18;
  const angle = offset * 7 * spread + drag * 6 * (offset === 0 ? 0.6 : 0.9);
  const x = offset * 46 * spread + drag * 22 * (Math.abs(offset) / mid);
  const y = Math.abs(offset) * 8;
  const isActive = active === i;
  const isChosen = chosen === i;
  return {
    rotate: angle * (isActive && !parting ? 0.4 : 1),
    x,
    y: y + (isActive && !parting ? -34 : 0) + (parting ? 40 : 0),
    scale: isChosen ? 1.12 : isActive && !parting ? 1.08 : 1,
    zIndex: isChosen ? 40 : isActive ? 30 : 10 + (10 - Math.abs(offset)),
    opacity: parting ? (isChosen ? 1 : 0.28) : 1,
  };
}

// ------- ceremony state -------

type CeremonyPhase = "idle" | "parting" | "flipping" | "revealed";

// Weighted cubic-bezier — the fan parts slowly, the chosen card
// travels with authority, the flip lands with a soft settle.
const EASE_TRAVEL: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_FLIP: [number, number, number, number] = [0.65, 0, 0.35, 1];

// ------- component -------

function DrawPage() {
  const { features } = useFeatures();
  const reduced = useReducedMotion() ?? false;
  const [mode, setMode] = useState<"today" | "random">("today");
  const [seed, setSeed] = useState(0);

  // The "committed" drawn card (what the stage renders face-up).
  const [drawn, setDrawn] = useState<Feature | null>(null);
  const [drawnIndex, setDrawnIndex] = useState<number>(0);

  // Ceremony transitional state. `pending` is the card that will land
  // once the ceremony resolves. `chosenFanIndex` locks the fan card
  // that "traveled" to the stage so we can dim its siblings.
  const [pending, setPending] = useState<{ feature: Feature; idx: number } | null>(null);
  const [chosenFanIndex, setChosenFanIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<CeremonyPhase>("idle");

  // Pointer state for drag-tilt on the fan.
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState(0); // -1..1
  const fanRef = useRef<HTMLDivElement | null>(null);
  const dragActive = useRef(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Compute the fan sample. Reshuffle whenever seed changes.
  const fan = useMemo(() => {
    if (features.length === 0) return [] as Array<{ f: Feature; idx: number }>;
    const rng = mulberry32(seed || 1);
    const pool = features.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(FAN_COUNT, pool.length)).map((f) => ({
      f,
      idx: features.indexOf(f) + 1,
    }));
  }, [features, seed]);

  // Initial draw: today's daily feature. No ceremony on first load —
  // reveal it silently so the page has a card without a startle.
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

  /**
   * Run the full ceremonial draw sequence. Sub-timings:
   *   0    →  400ms  parting — fan spreads, chosen card lifts + scales
   *   400  →  650ms  stillness — chosen back-face at center stage
   *   650  → 1100ms  flipping — 3D flip + gold bloom peaks + shimmer
   *   1100 →  ...    revealed — drawn state committed, fan resets
   *
   * On reduced-motion we do a plain crossfade in ~250ms.
   */
  const runCeremony = useCallback(
    (feature: Feature, idx: number, fanIndex: number | null) => {
      if (reduced) {
        setDrawn(feature);
        setDrawnIndex(idx);
        setPending(null);
        setChosenFanIndex(null);
        setPhase("idle");
        return;
      }
      // Reset any prior ceremony state first so re-draws re-run the sequence
      // from the top rather than snapping to the final frame.
      setPending({ feature, idx });
      setChosenFanIndex(fanIndex);
      setDrawn(null);
      setPhase("parting");
      window.setTimeout(() => setPhase("flipping"), 650);
      window.setTimeout(() => {
        setDrawn(feature);
        setDrawnIndex(idx);
        setPhase("revealed");
      }, 1100);
      window.setTimeout(() => {
        setPending(null);
        setChosenFanIndex(null);
        setPhase("idle");
      }, 1400);
    },
    [reduced],
  );

  const reshuffleAndDraw = useCallback(() => {
    if (features.length === 0) return;
    const s = Math.floor(Math.random() * 2 ** 31);
    setSeed(s);
    setMode("random");
    const i = pickIndex(features, s);
    // No fan-card index — this is a "top of deck" shuffle draw.
    runCeremony(features[i], i + 1, null);
  }, [features, runCeremony]);

  const drawToday = useCallback(() => {
    if (features.length === 0) return;
    const s = hashString(`atlas-${todayKey()}`);
    setSeed(s);
    setMode("today");
    const i = pickIndex(features, s);
    runCeremony(features[i], i + 1, null);
  }, [features, runCeremony]);

  const handleFanPick = useCallback(
    (i: number) => {
      const entry = fan[i];
      if (!entry) return;
      runCeremony(entry.f, entry.idx, i);
    },
    [fan, runCeremony],
  );

  // -------- Pointer handling on the fan --------
  // We track two things:
  //   (a) a normalized drag offset in [-1, 1] so cards spread + tilt
  //       toward the pointer as it sweeps across
  //   (b) the nearest card index so it lifts + prefocuses under the pointer
  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = fanRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const halfW = rect.width / 2;
      // clamp normalized offset
      const norm = Math.max(-1, Math.min(1, (clientX - cx) / halfW));
      setDrag(norm);
      // find the card whose center is nearest the pointer
      const target = document.elementFromPoint(clientX, clientY);
      const card = target?.closest("[data-fan-card]") as HTMLElement | null;
      if (card) {
        const idx = Number(card.dataset.fanCard);
        if (!Number.isNaN(idx)) setHover(idx);
      }
    },
    [],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    dragActive.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    updateFromPointer(e.clientX, e.clientY);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const wasDragging = dragActive.current;
    dragActive.current = false;
    // Spring the drag back to 0
    setDrag(0);
    if (!wasDragging) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const card = el?.closest("[data-fan-card]") as HTMLElement | null;
    if (card) {
      const idx = Number(card.dataset.fanCard);
      if (!Number.isNaN(idx)) handleFanPick(idx);
    }
    setHover(null);
  };
  const onPointerLeave = () => {
    if (dragActive.current) return;
    setDrag(0);
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

  // The pending back-face card shown center-stage during parting + flip.
  const traveling = pending;
  const showBackFace = phase === "parting";
  const showFlip = phase === "flipping";

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
          style={{ aspectRatio: "700 / 1225", perspective: 1800 }}
        >
          {/* Ceremonial traveling card — rendered only during the sequence.
              Slides up from the fan region and scales into stage size. */}
          <AnimatePresence>
            {traveling && !reduced && phase !== "revealed" && (
              <motion.div
                key={`traveling-${traveling.feature.id}-${seed}`}
                className="pointer-events-none absolute inset-0"
                style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
                initial={{ y: 220, scale: 0.42, opacity: 0, rotateZ: -4 }}
                animate={
                  showFlip
                    ? { y: 0, scale: 1, opacity: 1, rotateZ: 0, rotateY: 180 }
                    : { y: 0, scale: 1, opacity: 1, rotateZ: 0, rotateY: 0 }
                }
                exit={{ opacity: 0 }}
                transition={
                  showFlip
                    ? { duration: 0.45, ease: EASE_FLIP }
                    : { duration: 0.4, ease: EASE_TRAVEL }
                }
              >
                {/* Gold bloom — peaks at the flip apex */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -inset-10 rounded-[44px]"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(201,169,97,0.65), transparent 70%)",
                    filter: "blur(28px)",
                    backfaceVisibility: "hidden",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showFlip ? [0, 1, 0.35] : 0 }}
                  transition={{ duration: 0.45, times: [0, 0.5, 1] }}
                />
                {/* Card back — face during parting, becomes the back of the
                    flip during the flip phase (rendered on the front face
                    while rotateY = 0..180). */}
                {showBackFace ? (
                  <TarotCard
                    feature={traveling.feature}
                    index={traveling.idx}
                    faceUp={false}
                    className="h-full w-full drop-shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)]"
                  />
                ) : (
                  <div
                    className="relative h-full w-full"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <TarotCard
                        feature={traveling.feature}
                        index={traveling.idx}
                        faceUp={false}
                        className="h-full w-full drop-shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)]"
                      />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <TarotCard
                        feature={traveling.feature}
                        index={traveling.idx}
                        faceUp
                        className="h-full w-full drop-shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)]"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Particle shimmer — bursts as the face lands. */}
          <AnimatePresence>
            {phase === "revealed" && !reduced && (
              <ShimmerBurst key={`shimmer-${drawn?.id}-${seed}`} />
            )}
          </AnimatePresence>

          {/* Committed drawn card — visible whenever ceremony is idle or
              after revealed. Reduced-motion path uses this directly with
              a plain crossfade. */}
          <AnimatePresence mode="wait">
            {drawn && phase !== "parting" && phase !== "flipping" && (
              <motion.div
                key={`drawn-${drawn.id}-${seed}`}
                className="absolute inset-0"
                initial={
                  reduced
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.98 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: reduced ? 0.25 : 0.3, ease: EASE_TRAVEL }}
              >
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

        {drawn && phase !== "parting" && phase !== "flipping" && (
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
          onPointerCancel={onPointerLeave}
          onPointerLeave={onPointerLeave}
          className="relative mx-auto flex h-[280px] w-full max-w-3xl touch-none items-end justify-center sm:h-[340px]"
          role="listbox"
          aria-label="Card fan"
        >
          {fan.map((entry, i) => {
            const parting = phase === "parting" || phase === "flipping";
            const t = fanTransform(i, fan.length, hover, drag, parting, chosenFanIndex);
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
                animate={{
                  rotate: t.rotate,
                  x: t.x,
                  y: t.y,
                  scale: t.scale,
                  opacity: t.opacity,
                }}
                transition={{ type: "spring", stiffness: 240, damping: 24, mass: 0.9 }}
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

/**
 * ShimmerBurst — a soft particle spray that fires once when the drawn
 * card's face lands. Twelve tiny gold specks radiate outward and fade,
 * built with framer so it plays exactly once per mount and cleans up
 * on unmount. Purely decorative, never rendered when reduced-motion is
 * active.
 */
function ShimmerBurst() {
  const particles = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 90 + Math.random() * 70;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        delay: Math.random() * 0.08,
        size: 3 + Math.random() * 3,
      };
    });
  }, []);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, rgba(224,199,136,0.95) 0%, rgba(201,169,97,0.4) 60%, transparent 100%)",
            boxShadow: "0 0 8px 2px rgba(201,169,97,0.5)",
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
          transition={{ duration: 0.9, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}
