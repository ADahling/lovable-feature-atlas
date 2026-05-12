import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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

export function FeatureCard({ feature, onClick }: FeatureCardProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLButtonElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);

  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 25 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 25 });

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    if (!isMobile) {
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
          rotateX: isMobile ? 0 : springRotateX,
          rotateY: isMobile ? 0 : springRotateY,
        }}
        className={
          "feature-card relative flex w-full flex-col gap-5 overflow-hidden rounded-2xl border border-cream/10 bg-ink p-6 text-left min-h-[220px] transition-colors duration-300 " +
          hoverBorderByStatus[feature.status]
        }
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(160px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255,45,135,0.12), transparent 60%)",
          }}
        />

        {/* Editorial eyebrow */}
        <div className="relative flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55">
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
            <h2 className="font-sans text-[18px] font-semibold text-cream">
              {feature.name}
            </h2>
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 h-px w-full bg-emerald origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream/50">
            {fmtMonthYear(feature.releaseDate)}
          </p>
          <p className="font-sans text-[13px] text-cream/65 line-clamp-2">
            {feature.tagline}
          </p>
        </div>
      </motion.button>
    </div>
  );
}
