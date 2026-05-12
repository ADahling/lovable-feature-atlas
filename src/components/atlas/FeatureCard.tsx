import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { type Feature } from "../../data/features";
import { useMediaQuery } from "../../hooks/use-media-query";

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
}

const fmtMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });

const statusPillStyles: Record<Feature["status"], string> = {
  GA: "bg-gold/15 text-gold",
  Beta: "bg-emerald/20 text-emerald",
  Removed: "bg-cream/15 text-cream/70",
};

const hoverBorderByStatus: Record<Feature["status"], string> = {
  GA: "group-hover:border-gold",
  Beta: "group-hover:border-emerald",
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
          "feature-card relative flex w-full flex-col gap-4 overflow-hidden rounded-2xl border border-cream/10 bg-ink p-6 text-left min-h-[220px] transition-colors duration-300 " +
          hoverBorderByStatus[feature.status]
        }
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(160px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(31,122,90,0.15), transparent 60%)",
          }}
        />

        {/* Top row */}
        <div className="relative flex items-start justify-between gap-3">
          <span className="text-[28px] leading-none" aria-hidden>
            {feature.icon}
          </span>
          <span
            className={
              "rounded-full px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] " +
              statusPillStyles[feature.status]
            }
          >
            {feature.status}
          </span>
        </div>

        {/* Middle */}
        <div className="relative flex flex-col gap-2">
          <h3 className="font-sans text-[18px] font-semibold text-cream">
            {feature.name}
          </h3>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream/55">
            {feature.category} · {fmtMonthYear(feature.releaseDate)}
          </p>
          <p className="font-sans text-[13px] text-cream/65 line-clamp-2">
            {feature.tagline}
          </p>
        </div>

        {/* Bottom right arrow */}
        <ArrowUpRight
          className="relative ml-auto mt-auto size-4 text-cream/40 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        />
      </motion.button>
    </div>
  );
}
