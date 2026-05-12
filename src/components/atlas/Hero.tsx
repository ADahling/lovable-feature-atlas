import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { features } from "../../data/features";
import { useMediaQuery } from "../../hooks/use-media-query";
import { RadialMesh } from "./RadialMesh";
import { StatCounters } from "./StatCounters";
import { LovableHeart } from "./LovableHeart";

const Globe = lazy(() => import("./Globe"));

const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ParticleSphereFallback() {
  const dots = Array.from({ length: 40 });
  return (
    <div className="relative aspect-square w-full max-w-[320px] mx-auto">
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        const x = 50 + Math.cos(angle) * 42;
        const y = 50 + Math.sin(angle) * 42;
        return (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-emerald"
            style={{ left: `${x}%`, top: `${y}%` }}
            animate={{
              opacity: [0.25, 0.9, 0.25],
              x: [0, Math.cos(angle) * 4, 0],
              y: [0, Math.sin(angle) * 4, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i / dots.length) * 1.2,
            }}
          />
        );
      })}
    </div>
  );
}

export function Hero() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stats = useMemo(
    () => ({
      total: features.length,
      categories: new Set(features.map((f) => f.category)).size,
      ga: features.filter((f) => f.status === "GA").length,
    }),
    [],
  );

  return (
    <section className="relative isolate min-h-screen w-full overflow-hidden bg-ink text-cream">
      <RadialMesh />

      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col items-stretch gap-12 px-6 py-20 lg:flex-row lg:items-center lg:gap-8 lg:px-12">
        {/* Left: text + counters */}
        <div className="flex flex-col gap-8 lg:w-[45%]">
          {/* Logo lockup */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: REVEAL_EASE }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <LovableHeart className="size-12" />
            </motion.div>
            <span className="font-sans text-[16px] font-semibold tracking-tight text-cream">
              Lovable
            </span>
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: REVEAL_EASE }}
            className="text-cream"
            style={{
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              fontSize: "14px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Every feature. Every release. One atlas.
          </motion.p>

          {/* H1 mask reveal */}
          <div className="relative inline-block overflow-hidden">
            <h1
              className="font-sans font-semibold tracking-tight text-cream"
              style={{
                fontSize: "clamp(3rem, 6vw, 6rem)",
                lineHeight: 1.02,
                margin: 0,
              }}
            >
              The Lovable Feature Atlas
              <span className="sr-only"> — A complete catalog of every Lovable platform release.</span>
            </h1>
            <motion.span
              aria-hidden
              className="absolute inset-0"
              style={{ background: "var(--cream)", originY: 0 }}
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              transition={{
                duration: 1.1,
                ease: REVEAL_EASE,
                delay: 0.05,
              }}
            />
          </div>

          {/* Stat counters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.8, ease: REVEAL_EASE }}
          >
            <StatCounters
              total={stats.total}
              categories={stats.categories}
              ga={stats.ga}
            />
          </motion.div>
        </div>

        {/* Right: globe / fallback */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.3, ease: REVEAL_EASE }}
          className="relative flex h-[420px] w-full items-center justify-center lg:h-[640px] lg:w-[55%]"
        >
          {(!mounted || isMobile) ? (
            <ParticleSphereFallback />
          ) : (
            <Suspense fallback={<div className="size-full bg-ink" />}>
              <Globe />
            </Suspense>
          )}
        </motion.div>
      </div>
    </section>
  );
}
