import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRouter } from "@tanstack/react-router";
import { type Feature } from "../../data/features";
import { useMediaQuery } from "../../hooks/use-media-query";
import { fmtMonthYearUTC } from "../../lib/format-date";

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
}

const fmtMonthYear = fmtMonthYearUTC;

const statusDotClass: Record<Feature["status"], string> = {
  GA: "bg-emerald",
  Beta: "bg-gold",
  Removed: "bg-cream/40",
};

const statusTextClass: Record<Feature["status"], string> = {
  GA: "text-emerald",
  Beta: "text-gold",
  Removed: "text-cream/55",
};

const hoverBorderByStatus: Record<Feature["status"], string> = {
  GA: "group-hover:border-emerald",
  Beta: "group-hover:border-gold",
  Removed: "group-hover:border-cream/30",
};

const underlineByStatus: Record<Feature["status"], string> = {
  GA: "bg-emerald",
  Beta: "bg-gold",
  Removed: "bg-cream/40",
};

const hoverTextByStatus: Record<Feature["status"], string> = {
  GA: "group-hover:text-emerald",
  Beta: "group-hover:text-gold",
  Removed: "group-hover:text-cream/80",
};

export function FeatureCard({ feature, onClick }: FeatureCardProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const preloadedRef = useRef(false);

  const prefetch = () => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;
    void router.preloadRoute({
      to: "/features/$slug",
      params: { slug: feature.id },
    });
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);

  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 25 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 25 });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    if (!isMobile && mounted) {
      mouseX.set(px - 0.5);
      mouseY.set(py - 0.5);
    }
    el.style.setProperty("--glow-x", `${(e.clientX - rect.left).toFixed(0)}px`);
    el.style.setProperty("--glow-y", `${(e.clientY - rect.top).toFixed(0)}px`);
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="group" style={{ perspective: "1000px" }}>
      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          transformStyle: "preserve-3d",
          rotateX: (!mounted || isMobile) ? 0 : springRotateX,
          rotateY: (!mounted || isMobile) ? 0 : springRotateY,
        }}
        className={
          "feature-card relative flex w-full flex-col gap-4 overflow-hidden rounded-2xl border border-cream/15 bg-muted-ink p-6 text-left transition-colors duration-300 " +
          hoverBorderByStatus[feature.status]
        }
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "var(--glow-brand)" }}
        />

        {/* Editorial eyebrow */}
        <div className="t-label relative flex items-center justify-between gap-3 text-cream/55">
          <span className="flex items-center">
            <span
              aria-hidden
              className={"inline-block size-1.5 rounded-full mr-3 " + statusDotClass[feature.status]}
            />
            {feature.category}
          </span>
          <span className={statusTextClass[feature.status]}>{feature.status}</span>
        </div>

        {/* Middle */}
        <div className="relative flex flex-col gap-2">
          <div className="relative inline-block">
            <h2 className="t-card text-cream">
              {feature.name}
            </h2>
            <span
              aria-hidden
              className={"absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 " + underlineByStatus[feature.status]}
            />
          </div>
          <p className="t-label text-cream/45">
            {fmtMonthYear(feature.releaseDate)}
          </p>
          <p className="t-body-sm text-cream/75 line-clamp-2">
            {feature.tagline}
          </p>
          <div className={"mt-1 flex items-center gap-2 pt-2 text-cream/65 transition-colors " + hoverTextByStatus[feature.status]}>
            <span className="t-meta">View</span>
            <span aria-hidden className="text-base leading-none">→</span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}
