import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Copy, ExternalLink, Shuffle } from "lucide-react";
import { useFeatures } from "../hooks/use-features";
import type { FeatureCard as Feature } from "../lib/features.functions";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { TarotCard, svgToPngUrl } from "../components/atlas/TarotCard";
import { categoryAccentVar } from "../lib/category-theme";

export const Route = createFileRoute("/draw")({
  component: DrawPage,
  head: () => {
    const path = "/draw";
    const canonical = buildCanonicalTags({ path });
    const title = "Draw from the Atlas — a daily Lovable feature card";
    const description =
      "Draw an ornate tarot-style card from every Lovable feature. A new card each day, shareable as a high-res PNG.";
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

// Backs shown behind the active card. Four backs at the fixed
// spec transforms: rotations -10/-5/5/10 deg, x offsets ±72/±36,
// scale 0.65.
const BACK_SLOTS = [
  { rot: -10, x: -72 },
  { rot: -5, x: -36 },
  { rot: 5, x: 36 },
  { rot: 10, x: 72 },
] as const;

type Phase =
  | "idle"          // static — active face-up, backs collapsed
  | "fanning"       // backs spreading out to fanned positions (600ms)
  | "collapsing"    // backs snapping back into stacked deck
  | "flipping"      // active card flipping Y over 700ms
  | "shuffling";    // deck shuffle animation between draws

function DrawPage() {
  const { features } = useFeatures();
  const reduced = useReducedMotion() ?? false;

  const [seed, setSeed] = useState(0);
  const [drawn, setDrawn] = useState<Feature | null>(null);
  const [drawnIndex, setDrawnIndex] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [showFace, setShowFace] = useState(false); // true when active card flipped face-up
  // A cheap counter that makes shuffling visibly different each pass.
  const [shufflePass, setShufflePass] = useState(0);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  // Backs: four decorative back cards drawn from the deck (excluding the
  // active drawn card). Reshuffled per seed so successive draws look fresh.
  const backs = useMemo(() => {
    if (features.length === 0) return [] as Feature[];
    const rng = mulberry32(seed || 1);
    const pool = features.filter((f) => f.id !== drawn?.id).slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 4);
  }, [features, seed, drawn?.id]);

  const beginCeremony = useCallback(
    (feature: Feature, idx: number) => {
      clearTimers();
      setDrawn(feature);
      setDrawnIndex(idx);
      if (reduced) {
        setShowFace(true);
        setPhase("idle");
        return;
      }
      setShowFace(false);
      setPhase("fanning");
      // 600ms fan → collapse → 700ms flip
      timers.current.push(
        window.setTimeout(() => setPhase("collapsing"), 600),
        window.setTimeout(() => setPhase("flipping"), 900),
        window.setTimeout(() => {
          setShowFace(true);
          setPhase("idle");
        }, 900 + 700),
      );
    },
    [reduced],
  );

  // First entry: today's daily draw with full ceremony.
  useEffect(() => {
    if (features.length === 0 || drawn) return;
    const s = hashString(`atlas-${todayKey()}`);
    setSeed(s);
    const i = pickIndex(features, s);
    beginCeremony(features[i], i + 1);
  }, [features, drawn, beginCeremony]);

  const drawAgain = useCallback(() => {
    if (features.length === 0) return;
    clearTimers();
    const s = Math.floor(Math.random() * 2 ** 31);
    let i = pickIndex(features, s);
    if (drawn && features[i].id === drawn.id) {
      i = (i + 1) % features.length;
    }
    if (reduced) {
      setSeed(s);
      beginCeremony(features[i], i + 1);
      return;
    }
    // Tuck the current face-down into the deck, shuffle visibly twice
    // (~700ms), then reveal the new card.
    setShowFace(false);
    setPhase("shuffling");
    setShufflePass((n) => n + 1);
    timers.current.push(
      window.setTimeout(() => {
        setSeed(s);
        beginCeremony(features[i], i + 1);
      }, 720),
    );
  }, [features, drawn, reduced, beginCeremony]);

  const copyCard = useCallback(async () => {
    if (!svgRef.current || !drawn) return;
    try {
      const url = await svgToPngUrl(svgRef.current, 2);
      // Try clipboard first (write PNG blob); fall back to download.
      try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ]);
          return;
        }
      } catch {
        /* fall through to download */
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = `atlas-card-${drawn.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("[draw] copy failed", err);
    }
  }, [drawn]);

  const dateLabel = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Active card visual state.
  //  - fanning: face down, at rest
  //  - collapsing: face down, at rest
  //  - flipping: rotateY from 180 → 0 over 700ms (face-up reveal)
  //  - idle: face-up, at rest
  //  - shuffling: face down, small lift/tilt
  const activeRotateY =
    phase === "flipping" ? 0 : showFace ? 0 : 180;

  return (
    <main className="draw-no-select relative mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-5 pt-8 sm:px-8 sm:pt-10">
      <div className="mb-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cream/60 transition-colors hover:text-emerald"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to the atlas
        </Link>
      </div>

      <header className="mb-4 flex flex-col items-center gap-1 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald">
          Signature draw · {dateLabel}
        </p>
        <h1 className="font-display text-[28px] leading-[1.05] tracking-[-0.02em] text-cream sm:text-[34px]">
          Draw from the Atlas
        </h1>
      </header>

      {/* Deck stage — five cards centered. Fixed height so the whole
          ritual + actions land inside a 900px viewport with no scroll. */}
      <section
        aria-live="polite"
        className="relative mx-auto flex w-full flex-col items-center"
      >
        <div
          className="relative mx-auto"
          style={{
            perspective: "1400px",
            width: "min(320px, 32vh)",
            // Card ratio 700:1225 ≈ 0.5714. Cap height so the deck
            // never exceeds ~52vh at 1440x900.
            height: "min(560px, 56vh)",
          }}
        >
          {/* Back cards fanned behind — always rendered so the stage
              feels layered even when idle. */}
          {backs.map((back, i) => {
            const slot = BACK_SLOTS[i];
            const fanned = phase === "fanning";
            const shuffling = phase === "shuffling";
            const shuffleOffset = shuffling ? (i % 2 === 0 ? -14 : 14) : 0;
            const shuffleRot = shuffling ? (i % 2 === 0 ? -3 : 3) : 0;
            return (
              <motion.div
                key={`${back.id}-${shufflePass}-${i}`}
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2"
                style={{
                  width: "100%",
                  height: "100%",
                  marginLeft: "-50%",
                  marginTop: "-50%",
                  zIndex: 5 + i,
                  transformStyle: "preserve-3d",
                }}
                initial={false}
                animate={{
                  x: fanned ? slot.x : shuffleOffset,
                  y: fanned ? -6 : 0,
                  rotate: fanned ? slot.rot : shuffleRot,
                  scale: 0.65,
                  opacity: 1,
                }}
                transition={
                  shuffling
                    ? {
                        // Two visible shuffle passes over ~700ms.
                        duration: 0.7,
                        times: [0, 0.25, 0.5, 0.75, 1],
                        ease: "easeInOut",
                      }
                    : {
                        // Weighted spring with slight overshoot so cards
                        // feel like physical stock, not UI panels.
                        type: "spring",
                        stiffness: fanned ? 210 : 320,
                        damping: fanned ? 18 : 24,
                        mass: 0.9,
                      }
                }
              >
                <TarotCard
                  feature={back}
                  index={i + 1}
                  faceUp={false}
                  className="h-full w-full drop-shadow-[0_20px_44px_-18px_rgba(0,0,0,0.7)]"
                />
              </motion.div>
            );
          })}

          {/* Active card — sits on top, flips on the Y axis over 700ms. */}
          {drawn && (
            <motion.div
              className="absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
                zIndex: 20,
                transformOrigin: "center center",
              }}
              animate={{
                rotateY: activeRotateY,
                y: phase === "shuffling" ? -8 : 0,
              }}
              transition={
                phase === "flipping"
                  ? { duration: 0.7, ease: [0.65, 0, 0.35, 1] }
                  : phase === "shuffling"
                    ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                    : {
                        // Weighted spring with a touch of overshoot so
                        // the card settles like real stock.
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        mass: 0.95,
                      }
              }
            >
              {/* Back face */}
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <TarotCard
                  feature={drawn}
                  index={drawnIndex}
                  faceUp={false}
                  className="h-full w-full drop-shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
                />
              </div>
              {/* Front face — SVG plus a foil sheen overlay that
                  sweeps across on settle/hover, sold as a physical
                  gilt-stock artifact. */}
              <div
                className="group/face absolute inset-0 overflow-hidden rounded-[18px]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <TarotCard
                  ref={svgRef}
                  feature={drawn}
                  index={drawnIndex}
                  faceUp
                  className="h-full w-full drop-shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
                />
                {showFace && (
                  <span
                    key={`sheen-${drawn.id}`}
                    aria-hidden
                    className="atlas-foil-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 group-hover/face:[animation-iteration-count:2]"
                    style={{
                      background:
                        "linear-gradient(100deg, transparent 0%, rgba(251,245,233,0.08) 40%, rgba(216,183,112,0.32) 50%, rgba(251,245,233,0.08) 60%, transparent 100%)",
                      mixBlendMode: "screen",
                      animation:
                        "atlas-foil-sheen 1600ms 400ms cubic-bezier(0.22, 1, 0.36, 1) 1 forwards",
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Docked plinth — integrated action strip beneath the card.
            Same border-radius + gold hairline stroke as the card so
            the whole ritual reads as one physical artifact. */}
        <div
          className={
            "mt-5 transition-opacity duration-300 " +
            (showFace ? "opacity-100" : "opacity-40 pointer-events-none")
          }
          style={{ width: "min(320px, 32vh)" }}
        >
          <div
            className="flex items-stretch justify-center gap-0 overflow-hidden rounded-[14px] border border-gold/40 bg-ink/70 shadow-[0_18px_44px_-22px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(251,245,233,0.06)] backdrop-blur"
          >
            <button
              type="button"
              onClick={drawAgain}
              className="inline-flex flex-1 items-center justify-center gap-2 border-r border-gold/25 bg-transparent px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/70"
            >
              <Shuffle className="size-4" aria-hidden />
              Draw again
            </button>
            {drawn && (
              <Link
                to="/features/$slug"
                params={{ slug: drawn.id }}
                className="inline-flex flex-1 items-center justify-center gap-2 border-r border-gold/25 bg-transparent px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-emerald transition-colors hover:bg-emerald/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald/70"
              >
                <ExternalLink className="size-4" aria-hidden />
                View feature
              </Link>
            )}
            <button
              type="button"
              onClick={copyCard}
              className="inline-flex items-center justify-center gap-2 bg-transparent px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/75 transition-colors hover:bg-cream/5 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream/50"
              aria-label="Copy card as PNG"
            >
              <Copy className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {drawn && showFace && (
            <motion.p
              key={`meta-${drawn.id}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="mt-3 max-w-md text-center font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50"
            >
              <span style={{ color: categoryAccentVar(drawn.category) }}>{drawn.category}</span>
              <span className="text-cream/40"> · </span>
              {drawn.status} · {features.length} cards in the deck
            </motion.p>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
