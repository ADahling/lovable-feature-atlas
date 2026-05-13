import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useFeatures } from "../../hooks/use-features";
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

  const { features } = useFeatures();
  const stats = useMemo(
    () => ({
      total: features.length,
      categories: new Set(features.map((f) => f.category)).size,
      ga: features.filter((f) => f.status === "GA").length,
    }),
    [features],
  );

  return (
    <section className="relative isolate min-h-screen w-full overflow-hidden bg-ink text-cream">
      <RadialMesh />

      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col items-stretch gap-8 px-6 py-12 sm:gap-12 sm:py-20 lg:flex-row lg:items-center lg:gap-8 lg:px-12">
        {/* Left: text + counters */}
        <div className="flex flex-col gap-8 lg:w-[45%]">
          {/* Logo lockup */}
          <motion.div
            initial={mounted ? { scale: 0.6, opacity: 0, rotate: -8 } : false}
            animate={mounted ? { scale: 1, opacity: 1, rotate: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.2, ease: REVEAL_EASE }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <LovableHeart className="size-9" />
            </motion.div>
            <span className="font-sans text-[15px] font-medium tracking-tight text-cream/90">
              Lovable
            </span>
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            initial={mounted ? { opacity: 0, y: 8 } : false}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, delay: 0.8, ease: REVEAL_EASE }}
            className="flex items-center gap-4"
          >
            <span
              aria-hidden
              className="h-px w-10"
              style={{ background: "var(--gradient-brand)", ["--gradient-angle" as any]: "90deg" }}
            />
            <p className="t-eyebrow m-0 text-cream/60">
              Every feature. Every release. One atlas.
            </p>
          </motion.div>

          {/* H1 mask reveal */}
          <div className="relative inline-block overflow-hidden">
            <h1
              className="t-display m-0"
              style={{
                backgroundImage: "var(--gradient-display)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              The Lovable Feature Atlas
              <span className="sr-only"> — A complete catalog of every Lovable platform release.</span>
            </h1>
            {mounted && (
              <motion.span
                aria-hidden
                className="absolute inset-0"
                style={{ background: "var(--ink)", originY: 0 }}
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={{
                  duration: 1.1,
                  ease: REVEAL_EASE,
                  delay: 0.05,
                }}
              />
            )}
          </div>

          {/* Stat counters */}
          <motion.div
            initial={mounted ? { opacity: 0, y: 10 } : false}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
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
          initial={mounted ? { opacity: 0 } : false}
          animate={mounted ? { opacity: 1 } : undefined}
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
