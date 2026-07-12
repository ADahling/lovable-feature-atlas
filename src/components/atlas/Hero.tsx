import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import { Link } from "@tanstack/react-router";
import { ExternalLink, Sparkles, Stars, X } from "lucide-react";

const HINT_KEY = "atlas.hero-hint-dismissed";
const HINT_SESSION_KEY = "atlas.hero-hint-shown-session";
const HERO_ENTERED_KEY = "atlas.hero-entered-session";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useFeatures } from "../../hooks/use-features";
import { useTheme } from "../../hooks/use-theme";
import { RadialMesh } from "./RadialMesh";
import { LovableHeart } from "./LovableHeart";
import { LightHeroHeart } from "./LightHeroHeart";
import { HeroConstellation } from "./HeroConstellation";
import { useTiltParallax } from "../../lib/use-tilt-parallax";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "../ui/sheet";
import { accentForCategory } from "../../lib/category-theme";
import { fmtMonthYearUTC } from "../../lib/format-date";
import type { FeatureCard } from "../../lib/features.functions";

const Globe = lazy(() => import("./Globe"));

const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ---------- Mobile CSS heart (no 3D bundle) ----------

function MobileHeart() {
  // Drifting tag-scatter dots + slow-pulse heart. Pure CSS/framer, lightweight.
  // On devices with orientation sensors, tilting the phone parallaxes the
  // heart + scatter layers so the hero feels like a window, not a poster.
  const tilt = useTiltParallax({ pointer: false });
  const showTiltPrompt = tilt.permissionState === "prompt";

  const scatter = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2 + (i % 2) * 0.3;
        const r = 40 + (i % 3) * 6;
        return {
          x: 50 + Math.cos(angle) * r,
          y: 50 + Math.sin(angle) * r,
          delay: (i % 5) * 0.4,
          size: i % 3 === 0 ? 3 : 2,
        };
      }),
    [],
  );

  // Parallax offsets — heart moves more than scatter, scatter more than halo.
  const heartX = tilt.x * 14;
  const heartY = tilt.y * 10;
  const scatterX = tilt.x * 22;
  const scatterY = tilt.y * 16;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      {/* Halo */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--emerald) 24%, transparent), transparent 72%)",
          transform: `translate3d(${tilt.x * 6}px, ${tilt.y * 4}px, 0)`,
          transition: "transform 200ms ease-out",
        }}
      />
      {/* Drifting scatter dots */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${scatterX}px, ${scatterY}px, 0)`,
          transition: "transform 220ms ease-out",
        }}
      >
        {scatter.map((d, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-gold/70"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              y: [0, -6, 0, 4, 0],
              opacity: [0.35, 0.9, 0.6, 0.9, 0.35],
            }}
            transition={{
              duration: 6 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: d.delay,
            }}
          />
        ))}
      </div>
      {/* Heart */}
      <motion.div
        className="absolute inset-[22%] grid place-items-center"
        animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          transform: `translate3d(${heartX}px, ${heartY}px, 0)`,
        }}
      >
        <LovableHeart className="size-full drop-shadow-[0_0_28px_rgba(31,122,90,0.5)]" aria-hidden />
      </motion.div>

      {showTiltPrompt && (
        <button
          type="button"
          onClick={() => {
            void tilt.requestPermission();
          }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-gold/40 bg-ink/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-gold/90 backdrop-blur"
        >
          Tap to enable tilt
        </button>
      )}
    </div>
  );
}

// ---------- Line reveal helper ----------

const FILL_STYLE: React.CSSProperties = {
  backgroundImage: "var(--gradient-display)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

function LineReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  reduced?: boolean;
  className?: string;
}) {
  // Renders the final visible state in SSR / first paint so the h1
  // "The Lovable Feature Atlas" is present from frame zero — no more
  // hidden-then-slide-in pop that made the title feel to arrive late.
  return (
    <span className={"block " + className} style={FILL_STYLE}>
      {children}
    </span>
  );
}





// ---------- Hero ----------

export function Hero() {
  // Mobile breakpoint no longer JS-gated — see `lg:hidden` on the MobileHeart wrapper.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTouch = useMediaQuery("(pointer: coarse)");
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const theme = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const [hintDismissed, setHintDismissed] = useState(true);
  const [heroEntered, setHeroEntered] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const permanentlyDismissed = window.localStorage.getItem(HINT_KEY) === "1";
      const shownThisSession = window.sessionStorage.getItem(HINT_SESSION_KEY) === "1";
      const dismissed = permanentlyDismissed || shownThisSession;
      setHintDismissed(dismissed);
      if (!dismissed) {
        // Mark as shown for the rest of this session so toggling
        // dark → light → dark never resurrects the hint.
        window.sessionStorage.setItem(HINT_SESSION_KEY, "1");
      }
      const entered = window.sessionStorage.getItem(HERO_ENTERED_KEY) === "1";
      setHeroEntered(entered);
      if (!entered) {
        window.sessionStorage.setItem(HERO_ENTERED_KEY, "1");
      }
    } catch {
      setHintDismissed(false);
    }
  }, []);
  const dismissHint = () => {
    setHintDismissed(true);
    try {
      window.localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Defer 3D globe hydration until the main thread is idle. Keeps the
  // Three.js chunk (~500 KB gzipped) out of the critical path so first
  // paint and TTI don't wait on it. Light theme uses a pure-SVG heart and
  // never touches this branch.
  const [globeReady, setGlobeReady] = useState(false);
  useEffect(() => {
    if (theme !== "dark") return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => setGlobeReady(true), { timeout: 1500 });
      return () => {
        (w as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
      };
    }
    const t = window.setTimeout(() => setGlobeReady(true), 400);
    return () => window.clearTimeout(t);
  }, [theme]);

  // Scroll-linked parallax — heart drifts up ~140px slower than the page,
  // dust/glow drift half that. Framer clamps by default when target is set.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const heartY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -140]);
  const heartScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.06]);

  // Cursor parallax — heart tilts subtly toward the pointer. Uses motion
  // values so React never re-renders. Spring-smoothed for buttery feel.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springCfg = { stiffness: 90, damping: 18, mass: 0.6 };
  const tiltX = useSpring(useTransform(py, [-1, 1], reduced ? [0, 0] : [6, -6]), springCfg);
  const tiltY = useSpring(useTransform(px, [-1, 1], reduced ? [0, 0] : [-8, 8]), springCfg);
  const parX = useSpring(useTransform(px, [-1, 1], reduced ? [0, 0] : [-14, 14]), springCfg);
  const parY = useSpring(useTransform(py, [-1, 1], reduced ? [0, 0] : [-10, 10]), springCfg);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduced) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      px.set(Math.max(-1, Math.min(1, nx)));
      py.set(Math.max(-1, Math.min(1, ny)));
      // Foil specular tracking — light mode only picks this up via CSS.
      // Set as percent on the hero section so any child with
      // `.foil-specular` renders a warm gold highlight under the cursor.
      el.style.setProperty("--foil-x", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--foil-y", `${((e.clientY - r.top) / r.height) * 100}%`);
      el.classList.add("foil-active");
    };
    const onLeave = () => {
      px.set(0);
      py.set(0);
      el.classList.remove("foil-active");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [px, py, reduced]);

  const { features } = useFeatures();
  const stats = useMemo(
    () => ({
      total: features.length,
      categories: new Set(features.map((f) => f.category)).size,
      ga: features.filter((f) => f.status === "GA").length,
    }),
    [features],
  );

  // Choreography timing (all under 1.5s, skipped when reduced)
  const t = reduced
    ? { logo: 0, eyebrow: 0, line1: 0, line2: 0, subhead: 0, stats: 0, cta: 0, globe: 0 }
    : {
        logo: 0.05,
        eyebrow: 0.3,
        line1: 0.18,
        line2: 0.3, // 120ms stagger — more visible
        subhead: 0.85,
        stats: 1.0,
        cta: 1.25,
        globe: 0.15,
      };

  return (
    <section
      ref={sectionRef}
      data-atlas-hero-canvas
      className="relative isolate w-full overflow-hidden bg-ink text-cream lg:min-h-[82vh]"
    >
      <RadialMesh />

      {/* Signature constellation — quiet, animated, clickable. Sits behind
          the hero title on desktop; fades out as the user scrolls into the
          catalog. Renders in BOTH themes: dark uses the night-sky palette,
          light uses deep-green and antique-gold star points on cream paper
          so the celestial layer is authored across the full site. */}
      {isDesktop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.55, ease: REVEAL_EASE }}
          className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
        >
          <HeroConstellation
            onFirstInteraction={dismissHint}
            skipEntrance={heroEntered}
            onSelect={setSelectedFeature}
          />
        </motion.div>
      )}

      {/* Headline veil — soft radial that increases contrast behind the
          title/lede/CTA block so filaments and nodes never fight the text.
          Tinted per theme so the celestial layer authors in light too. */}
      {isDesktop && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.55, ease: REVEAL_EASE }}
          className="pointer-events-none absolute inset-0 z-[2] hidden lg:block"
          style={{
            background:
              theme === "light"
                ? "radial-gradient(ellipse 55% 65% at 28% 48%, rgba(251,245,233,0.85) 0%, rgba(251,245,233,0.55) 35%, rgba(251,245,233,0.15) 65%, rgba(251,245,233,0) 82%)"
                : "radial-gradient(ellipse 55% 65% at 28% 48%, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.48) 35%, rgba(10,10,10,0.15) 65%, rgba(10,10,10,0) 82%)",
          }}
        />
      )}

      {/* Cold-load fallback — occupies the hero slot from first paint while
          the 3D globe chunk hydrates. Rendered ONLY in dark mode; in light
          mode `<LightHeroHeart />` is a hydrated SVG heart, so keeping this
          fallback visible would double-render the heart. Styled to match the
          final 3D heart's box exactly (same clamp, same right-column offset)
          and to read as darker enamel — not a bright teal blob — so the
          handoff to WebGL is a subtle material upgrade, not an object swap. */}
      <div
        aria-hidden
        data-atlas-hero-fallback
        className="pointer-events-none absolute inset-y-0 right-[-14%] z-0 hidden lg:block lg:w-[92%]"
        style={{
          opacity: theme === "dark" && !globeReady ? 1 : 0,
          visibility: theme === "dark" && !globeReady ? "visible" : "hidden",
          transition:
            theme === "dark" && !globeReady
              ? "opacity 220ms ease-out"
              : "opacity 220ms ease-out, visibility 0s linear 220ms",
        }}
      >
        <div className="relative grid size-full place-items-center">
          {/* Subtle enamel bloom — much dimmer than the active-state glow so
              the fallback reads as a resting object, not a spotlit hero. */}
          <span
            aria-hidden
            className="absolute aspect-square max-h-full max-w-full"
            style={{
              width: "min(52vw, 660px)",
              height: "min(72vh, 660px)",
              background:
                "radial-gradient(closest-side at 55% 50%, rgba(11,61,46,0.55) 0%, rgba(11,61,46,0.18) 45%, transparent 70%)",
              filter: "blur(28px)",
            }}
          />
          <div
            className="relative aspect-square max-h-full max-w-full"
            style={{
              width: "min(52vw, 660px)",
              height: "min(72vh, 660px)",
              filter:
                "brightness(0.72) saturate(0.85) drop-shadow(0 0 22px rgba(11,61,46,0.55))",
            }}
          >
            <LovableHeart className="size-full" aria-hidden />
          </div>
        </div>
      </div>


      {/* Signature hero object — dark: rotating 3D heart/globe.
          light: embossed gold-foil heart on warm paper. Both get scroll
          parallax + cursor tilt so toggling reveals a second world. */}
      {isDesktop && mounted && (
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={reduced ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: t.globe, ease: REVEAL_EASE }}
          style={{ y: heartY, scale: heartScale, x: parX, translateY: parY }}
          className="pointer-events-none absolute inset-y-0 right-[-14%] z-0 hidden lg:block lg:w-[92%]"
        >
          {/* Glow bloom behind the heart — pulses in with the entrance */}
          <div className="relative grid size-full place-items-center">
            <motion.span
              aria-hidden
              initial={reduced ? false : { opacity: 0, scale: 0.7 }}
              animate={reduced ? undefined : { opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: t.globe + 0.1, ease: REVEAL_EASE }}
              className="absolute aspect-square max-h-full max-w-full"
              style={{
                width: "min(52vw, 660px)",
                height: "min(72vh, 660px)",
                background:
                  theme === "light"
                    ? "radial-gradient(closest-side at 55% 50%, color-mix(in oklab, #C9A961 34%, transparent) 0%, color-mix(in oklab, #C9A961 12%, transparent) 40%, transparent 68%)"
                    : "radial-gradient(closest-side at 55% 50%, color-mix(in oklab, var(--emerald) 38%, transparent) 0%, color-mix(in oklab, var(--gold) 14%, transparent) 45%, transparent 72%)",
                filter: "blur(20px)",
              }}
            />
            <motion.div
              className="foil-specular relative aspect-square max-h-full max-w-full"
              style={{
                width: "min(52vw, 660px)",
                height: "min(72vh, 660px)",
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: 1200,
              }}
            >
              {theme === "light" ? (
                <LightHeroHeart className="size-full" />
              ) : globeReady ? (
                <Suspense fallback={<div className="size-full" />}>
                  <Globe theme={theme} />
                </Suspense>
              ) : (
                <div className="size-full" aria-hidden />
              )}
            </motion.div>
          </div>
        </motion.div>
      )}


      <div className="container-atlas relative z-10 flex flex-col justify-center gap-8 py-10 sm:py-14 lg:min-h-[82vh] lg:py-16">
        {/* Text column: full width, but content constrained so type overlaps globe */}
        <div className="flex flex-col gap-7 lg:max-w-[70%]">

          {/* Logo lockup */}
          <motion.div
            initial={mounted && !reduced ? { scale: 0.7, opacity: 0, rotate: -8 } : false}
            animate={mounted && !reduced ? { scale: 1, opacity: 1, rotate: 0 } : undefined}
            transition={{ duration: 0.55, delay: t.logo, ease: REVEAL_EASE }}
            className="flex flex-wrap items-center gap-3"
          >
            <motion.div
              animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <LovableHeart className="size-9" aria-hidden />
            </motion.div>
            <span className="font-mono text-[13px] uppercase tracking-[0.18em] text-cream/90">
              Feature Atlas
            </span>
            <span
              className="font-mono text-[11px] uppercase tracking-[0.16em] rounded-full border border-gold/50 bg-gold/10 px-3 py-1.5 text-gold"
              title="Community catalog — not affiliated with Lovable"
            >
              Community catalog
            </span>
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            initial={mounted && !reduced ? { opacity: 0, y: 6 } : false}
            animate={mounted && !reduced ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: t.eyebrow, ease: REVEAL_EASE }}
            className="flex items-center gap-4"
          >
            <span
              aria-hidden
              className="h-px w-10"
              style={{ background: "var(--gradient-brand)", ["--gradient-angle" as any]: "90deg" }}
            />
            <p className="t-eyebrow m-0 text-cream/60">
              Every Lovable feature. Every release. One atlas.
            </p>
          </motion.div>

          {/* H1 — per-line mask reveal, gradient fill */}
          <h1
            className="t-display m-0"
            style={{
              backgroundImage: "var(--gradient-display)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              // Soft ink halo so type reads over the globe behind it (dark only)
              filter:
                theme === "dark"
                  ? "drop-shadow(0 2px 24px rgba(10,10,10,0.55))"
                  : "drop-shadow(0 1px 12px rgba(251,245,233,0.6))",
            }}
          >
            <LineReveal delay={t.line1} reduced={reduced}>
              The Lovable
            </LineReveal>
            <LineReveal delay={t.line2} reduced={reduced}>
              Feature Atlas
            </LineReveal>
          </h1>

          {/* Subhead */}
          <motion.p
            initial={mounted && !reduced ? { opacity: 0, y: 8 } : false}
            animate={mounted && !reduced ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.55, delay: t.subhead, ease: REVEAL_EASE }}
            className="t-body max-w-xl text-cream/70"
          >
            An independent, fan-built catalog of every Lovable feature, beta, and release through 2026 —
            for ambassadors, power users, and teams evaluating the platform. Curated by{" "}
            <a
              href="https://dahlingdigital.com"
              target="_blank"
              rel="noopener"
              className="text-cream underline-offset-4 hover:text-emerald hover:underline"
            >
              Alicia Dahling
            </a>
            . Not affiliated with Lovable AB.
          </motion.p>

          {/* Glass data strip — three totals as one translucent instrument
              readout. Live values, mono type, cream hairline + inner dividers.
              Same numbers in both themes. */}
          <motion.div
            initial={mounted && !reduced ? { opacity: 0, y: 8 } : false}
            animate={mounted && !reduced ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, delay: t.stats, ease: REVEAL_EASE }}
            aria-label="Atlas totals"
            className="inline-flex w-fit items-stretch overflow-hidden rounded-full border border-cream/15 bg-cream/[0.04] backdrop-blur-md shadow-[0_1px_0_rgba(251,245,233,0.05)_inset]"
          >
            {[
              { value: stats.total, label: "features" },
              { value: stats.categories, label: "categories" },
              { value: stats.ga, label: "GA" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={
                  "flex items-baseline gap-2 px-4 py-2 sm:px-5 " +
                  (i > 0 ? "border-l border-cream/10" : "")
                }
              >
                <span className="font-mono tabular-nums text-[13px] tracking-[0.14em] text-cream">
                  {s.value}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/55">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>


          {/* CTA hierarchy — one clear journey. Primary: explore the catalog.
              Secondary: take the quiz. Tertiary: draw a card. The constellation
              is now the hero's visual experience itself, so it drops as a CTA. */}
          <motion.div
            initial={mounted && !reduced ? { opacity: 0, scale: 0.94 } : false}
            animate={mounted && !reduced ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.4, delay: t.cta, ease: REVEAL_EASE }}
          >
            <div className="flex flex-col items-start gap-3">
              <a
                href="#features"
                data-cursor="magnetic"
                className="group inline-flex items-center gap-2.5 rounded-md border border-gold bg-gold px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] text-ink shadow-[0_10px_28px_-12px_rgba(201,169,97,0.65)] transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-gold-soft hover:shadow-[0_14px_34px_-12px_rgba(201,169,97,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Explore all {stats.total} features
                <span aria-hidden className="opacity-70 transition-transform group-hover:translate-x-0.5">→</span>
              </a>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pl-1">
                <Link
                  to="/quiz"
                  data-cursor="magnetic"
                  className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/75 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                >
                  <Sparkles className="size-3.5" aria-hidden />
                  Take the quiz
                </Link>
                <span aria-hidden className="text-cream/20">·</span>
                <Link
                  to="/draw"
                  data-cursor="magnetic"
                  className="group inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                >
                  Draw a card
                  <span aria-hidden className="opacity-60 transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
                <span aria-hidden className="text-cream/20 lg:hidden">·</span>
                <Link
                  to="/constellation"
                  className="group hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-cream/60 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink max-lg:inline-flex"
                >
                  <Stars className="size-3" aria-hidden />
                  Open full constellation
                  <span aria-hidden className="opacity-60 transition-transform group-hover:translate-x-0.5">→</span>
                </Link>

              </div>

              {/* Interaction hint — desktop only, dark theme only, non-touch.
                  Nodes are subtle enough that new visitors miss the click
                  affordance. Fades out permanently once they hover any node. */}
              {isDesktop && theme === "dark" && !isTouch && !hintDismissed && mounted && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, delay: 1.6, ease: REVEAL_EASE }}
                  className="mt-1 pl-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/50"
                >
                  Explore the constellation
                  <span className="mx-2 text-cream/25" aria-hidden>·</span>
                  Hover to identify
                  <span className="mx-2 text-cream/25" aria-hidden>·</span>
                  Click to open
                </motion.p>
              )}
            </div>
          </motion.div>


        </div>

        {/* Mobile / tablet heart — compressed, CSS-only motion. Rendered
            immediately (no `mounted` gate) so a slow first paint or SSR
            snapshot still shows the heart. CSS-gated with `lg:hidden` so
            desktop viewers never see a duplicate heart during hydration. */}
        <div className="mt-2 sm:mt-6 lg:hidden">
          <MobileHeart />
        </div>

      </div>
    </section>
  );
}
