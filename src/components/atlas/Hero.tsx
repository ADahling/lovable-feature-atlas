import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useFeatures } from "../../hooks/use-features";
import { useTheme } from "../../hooks/use-theme";
import { RadialMesh } from "./RadialMesh";
import { StatCounters } from "./StatCounters";
import { LovableHeart } from "./LovableHeart";

const Globe = lazy(() => import("./Globe"));

const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ---------- Mobile CSS heart (no 3D bundle) ----------

function MobileHeart() {
  // Drifting tag-scatter dots + slow-pulse heart. Pure CSS/framer, lightweight.
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

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      {/* Halo */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--emerald) 24%, transparent), transparent 72%)",
        }}
      />
      {/* Drifting scatter dots */}
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
      {/* Heart */}
      <motion.div
        className="absolute inset-[22%] grid place-items-center"
        animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <LovableHeart className="size-full drop-shadow-[0_0_28px_rgba(31,122,90,0.5)]" />
      </motion.div>
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
  delay,
  reduced,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  reduced: boolean;
  className?: string;
}) {
  if (reduced) {
    return (
      <span className={"block " + className} style={FILL_STYLE}>
        {children}
      </span>
    );
  }
  return (
    <span
      className={"block overflow-hidden " + className}
      style={{ paddingBottom: "0.12em" }}
    >
      <motion.span
        className="block"
        style={FILL_STYLE}
        initial={{ y: "115%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 0.85, delay, ease: REVEAL_EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}





// ---------- Hero ----------

export function Hero() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const theme = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => setMounted(true), []);

  // Scroll-linked parallax — heart drifts up ~140px slower than the page,
  // dust/glow drift half that. Framer clamps by default when target is set.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const heartY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -140]);
  const heartScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.06]);

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
      className="relative isolate w-full overflow-hidden bg-ink text-cream lg:min-h-[82vh]"
    >
      <RadialMesh />

      {/* Globe layer — absolute on desktop so the heart bleeds behind the headline */}
      {isDesktop && mounted && (
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={reduced ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: t.globe, ease: REVEAL_EASE }}
          style={{ y: heartY, scale: heartScale }}
          className="pointer-events-none absolute inset-y-0 right-[-14%] z-0 hidden lg:block lg:w-[92%]"
        >
          {/* Glow bloom behind the heart — pulses in with the entrance */}
          <motion.span
            aria-hidden
            initial={reduced ? false : { opacity: 0, scale: 0.7 }}
            animate={reduced ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: t.globe + 0.1, ease: REVEAL_EASE }}
            className="absolute inset-0"
            style={{
              background:
                theme === "light"
                  ? "radial-gradient(closest-side at 55% 50%, color-mix(in oklab, #C9A961 30%, transparent) 0%, transparent 62%)"
                  : "radial-gradient(closest-side at 55% 50%, color-mix(in oklab, var(--emerald) 38%, transparent) 0%, color-mix(in oklab, var(--gold) 14%, transparent) 45%, transparent 72%)",
              filter: "blur(20px)",
            }}
          />
          <Suspense fallback={<div className="size-full" />}>
            <Globe theme={theme} />
          </Suspense>
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
              <LovableHeart className="size-9" />
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
            <span className="sr-only">The Lovable Feature Atlas — A community catalog of every Lovable platform release.</span>
            <span aria-hidden className="block">
              <LineReveal delay={t.line1} reduced={reduced}>
                The Lovable
              </LineReveal>
              <LineReveal delay={t.line2} reduced={reduced}>
                Feature Atlas
              </LineReveal>
            </span>
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

          {/* Stat counters */}
          <motion.div
            initial={mounted && !reduced ? { opacity: 0, y: 8 } : false}
            animate={mounted && !reduced ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, delay: t.stats, ease: REVEAL_EASE }}
          >
            <StatCounters
              total={stats.total}
              categories={stats.categories}
              ga={stats.ga}
              startDelay={reduced ? 0 : t.stats * 1000}
            />
          </motion.div>

          {/* Quiz CTA */}
          <motion.div
            initial={mounted && !reduced ? { opacity: 0, scale: 0.94 } : false}
            animate={mounted && !reduced ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.4, delay: t.cta, ease: REVEAL_EASE }}
          >
            <Link
              to="/quiz"
              data-cursor="magnetic"
              className="group inline-flex items-center gap-2 rounded-md border border-gold/60 bg-gold/5 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <Sparkles className="size-4" aria-hidden />
              Test yourself — how many of the {stats.total} have you used?
            </Link>
          </motion.div>
        </div>

        {/* Mobile / tablet heart — compressed, CSS-only motion. Rendered
            immediately (no `mounted` gate) so a slow first paint or SSR
            snapshot still shows the heart. */}
        {!isDesktop && (
          <div className={isMobile ? "mt-2" : "mt-6"}>
            <MobileHeart />
          </div>
        )}
      </div>
    </section>
  );
}
