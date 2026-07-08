import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { type Feature } from "../../data/features";
import { fmtMonthYearUTC } from "../../lib/format-date";
import { iconForCategory } from "../../lib/category-icons";

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
  /** Flagship feature — wider layout, more padding, emerald backdrop. */
  wide?: boolean;
  /** Reveal delay in ms, applied when the card enters the viewport once. */
  revealDelay?: number;
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

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function FeatureCard({ feature, onClick, wide = false, revealDelay = 0 }: FeatureCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const preloadedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const prefetch = () => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;
    void router.preloadRoute({
      to: "/features/$slug",
      params: { slug: feature.id },
    });
  };

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${(e.clientX - rect.left).toFixed(0)}px`);
    el.style.setProperty("--y", `${(e.clientY - rect.top).toFixed(0)}px`);
  };

  // Stagger reveal via IntersectionObserver — once only, skipped for reduced motion
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "-40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const emeraldBackdrop = wide
    ? "before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:opacity-70 before:[background:radial-gradient(60%_60%_at_20%_20%,color-mix(in_oklab,var(--emerald)_20%,transparent),transparent_70%)]"
    : "";

  return (
    <div
      className="group"
      style={{
        contentVisibility: "auto",
        // `auto` keyword allows the browser to remember the actual rendered
        // size after first paint, so cards don't stretch to the reserved value.
        containIntrinsicSize: wide ? "auto 320px" : "auto 240px",
      }}
    >

      <button
        ref={ref}
        type="button"
        onClick={onClick}
        onMouseEnter={prefetch}

        onFocus={prefetch}
        onTouchStart={prefetch}
        onMouseMove={handleMove}
        data-cursor="view"
        data-revealed={revealed || undefined}
        style={{
          transitionProperty: "transform, box-shadow, border-color, opacity",
          transitionDuration: "250ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDelay: revealed ? "0ms" : `${revealDelay}ms`,
          ...(revealed ? {} : { transform: "translate3d(0,16px,0)" }),
          opacity: revealed ? 1 : 0,
        }}
        className={
          "feature-card relative flex w-full flex-col gap-4 overflow-hidden rounded-2xl border border-cream/15 bg-muted-ink text-left will-change-transform " +
          "hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_20px_40px_-20px_rgb(0_0_0/0.5)] " +
          hoverBorderByStatus[feature.status] +
          " " +
          (wide ? "p-8 lg:p-10 " : "p-6 ") +
          emeraldBackdrop
        }
      >
        {/* Cursor-following gold radial highlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(180px circle at var(--x, 50%) var(--y, 50%), rgba(201,169,97,0.08), transparent 70%)",
          }}
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
            <h2 className={(wide ? "t-title" : "t-card") + " text-cream"}>
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
          <p className={(wide ? "t-body" : "t-body-sm") + " text-cream/75 " + (wide ? "line-clamp-3" : "line-clamp-2")}>
            {feature.tagline}
          </p>
          <div className={"mt-1 flex items-center gap-2 pt-2 text-cream/65 transition-colors " + hoverTextByStatus[feature.status]}>
            <span className="t-meta">View</span>
            <span aria-hidden className="text-base leading-none">→</span>
          </div>
        </div>
      </button>
    </div>
  );
}
