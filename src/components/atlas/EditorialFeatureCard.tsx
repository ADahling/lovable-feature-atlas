import { useRef, type CSSProperties } from "react";
import { useRouter } from "@tanstack/react-router";
import type { FeatureCard as Feature } from "../../lib/features.functions";
import { fmtMonthDayYearUTC } from "../../lib/format-date";
import { iconForCategory } from "../../lib/category-icons";
import { categoryAccentVar } from "../../lib/category-theme";
import { indexFromId, toRoman } from "../../lib/tarot-card";
import { truncateAtWord } from "../../lib/truncate";

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
  wide?: boolean;
  index?: number;
}

const statusClass: Record<Feature["status"], string> = {
  GA: "border-emerald/25 bg-emerald/[0.06] text-emerald",
  Beta: "border-gold/30 bg-gold/[0.08] text-gold",
  Removed: "border-line bg-cream/[0.03] text-cream/60",
};

const statusLabel: Record<Feature["status"], string> = {
  GA: "GA",
  Beta: "Beta",
  Removed: "Retired",
};

/**
 * A tactile editorial index card. The category color, type hierarchy, and
 * whole-card interaction carry the personality; pointer-tracked tilt,
 * spotlight effects, delayed popovers, and per-card animation loops do not.
 */
export function FeatureCard({ feature, onClick, wide = false, index }: FeatureCardProps) {
  const router = useRouter();
  const prefetched = useRef(false);
  const CategoryGlyph = iconForCategory(feature.category);
  const accent = categoryAccentVar(feature.category);
  const romanIndex = toRoman(index ?? indexFromId(feature.id));
  const tagline = truncateAtWord(feature.tagline, wide ? 170 : 112);

  function prefetch() {
    if (prefetched.current) return;
    prefetched.current = true;
    void router.preloadRoute({
      to: "/features/$slug",
      params: { slug: feature.id },
    });
  }

  return (
    <article
      data-atlas-feature-card
      className="group h-full"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: wide ? "auto 270px" : "auto 230px",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        onFocus={prefetch}
        onPointerEnter={prefetch}
        onTouchStart={prefetch}
        aria-labelledby={`feature-card-name-${feature.id}`}
        data-status={feature.status}
        className={
          "card-cine flex h-full min-h-[228px] w-full overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink " +
          (wide ? "p-6 sm:p-8" : "p-5 sm:p-6")
        }
        style={{ "--card-accent": accent } as CSSProperties}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 transition-[width] duration-200 group-hover:w-1.5 group-focus-within:w-1.5"
          style={{ background: accent }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-5 -right-4 opacity-[0.08] transition-opacity duration-200 group-hover:opacity-[0.14]"
          style={{ color: accent }}
        >
          <CategoryGlyph size={wide ? 132 : 104} strokeWidth={1.2} aria-hidden />
        </span>

        <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className="inline-flex min-w-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]"
              style={{ color: accent }}
            >
              <CategoryGlyph size={14} strokeWidth={1.6} aria-hidden />
              <span className="truncate">{feature.category}</span>
              <span aria-hidden className="text-gold/55">· {romanIndex}</span>
            </span>
            <span
              className={`rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${statusClass[feature.status]}`}
            >
              {statusLabel[feature.status]}
            </span>
          </div>

          <div className={wide ? "mt-10 max-w-2xl" : "mt-8"}>
            <h2
              id={`feature-card-name-${feature.id}`}
              className={
                "font-display font-medium leading-[1.06] tracking-[-0.02em] text-cream [text-wrap:balance] " +
                (wide ? "text-[clamp(1.8rem,3vw,2.75rem)]" : "text-[1.55rem]")
              }
            >
              {feature.name}
            </h2>
            <p className="mt-3 max-w-[58ch] text-[14px] leading-relaxed text-cream/70 [text-wrap:pretty]">
              {tagline}
            </p>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-8">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/50">
                Premiered
              </p>
              <p className="font-mono text-[11px] tabular-nums text-cream/75">
                {fmtMonthDayYearUTC(feature.releaseDate)}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/65 transition-colors group-hover:text-emerald group-focus-within:text-emerald"
            >
              Open record <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

