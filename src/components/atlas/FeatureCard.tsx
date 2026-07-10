import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import type { FeatureCard as Feature } from "../../lib/features.functions";
import { fmtMonthYearUTC } from "../../lib/format-date";
import { CategoryGlyph } from "./CategoryGlyph";
import { tintForCategory } from "../../lib/category-theme";
import { toRoman, indexFromId } from "../../lib/tarot-card";
import { truncateAtWord } from "../../lib/truncate";
import { FlagshipMotif, hasFlagshipMotif } from "./FlagshipMotif";

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
  /** Flagship feature — wider layout, two-column interior with a motif visual. */
  wide?: boolean;

  /** 1-based position for the tarot-index roman numeral. Falls back to a
   * deterministic hash of the feature id when omitted (feature detail /
   * category pages that don't pass a position). */
  index?: number;

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

// Hover border color per status now lives in src/styles.css
// (.feature-card[data-status="…"]:hover) — see comment there.


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


export function FeatureCard({ feature, onClick, wide = false, index }: FeatureCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const preloadedRef = useRef(false);
  // Reveal gating removed — the enclosing FeatureGrid motion.div drives
  // the fade-up via whileInView. Cards mount at data-revealed="true" so
  // the hover tilt CSS (which keys on that attribute) actually matches.
  const revealed = true;
  // Spring-smoothed tilt targets — updated by pointer, lerped via rAF.
  const tiltTarget = useRef({ rx: 0, ry: 0 });
  const tiltCurrent = useRef({ rx: 0, ry: 0 });
  const rafRef = useRef<number | null>(null);

  const prefetch = () => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;
    void router.preloadRoute({
      to: "/features/$slug",
      params: { slug: feature.id },
    });
  };

  const tiltEnabled = () => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(pointer: coarse)").matches) return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return true;
  };

  const stepTilt = () => {
    const el = ref.current;
    if (!el) { rafRef.current = null; return; }
    const cur = tiltCurrent.current;
    const tgt = tiltTarget.current;
    // Simple critically-damped-ish lerp
    cur.rx += (tgt.rx - cur.rx) * 0.18;
    cur.ry += (tgt.ry - cur.ry) * 0.18;
    el.style.setProperty("--rx", `${cur.rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${cur.ry.toFixed(2)}deg`);
    if (Math.abs(tgt.rx - cur.rx) > 0.02 || Math.abs(tgt.ry - cur.ry) > 0.02) {
      rafRef.current = requestAnimationFrame(stepTilt);
    } else {
      rafRef.current = null;
    }
  };

  const scheduleTilt = () => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(stepTilt);
  };

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    el.style.setProperty("--x", `${relX.toFixed(0)}px`);
    el.style.setProperty("--y", `${relY.toFixed(0)}px`);
    if (!tiltEnabled()) return;
    // Normalize to [-1, 1], max ~2.5deg
    const nx = (relX / rect.width) * 2 - 1;
    const ny = (relY / rect.height) * 2 - 1;
    tiltTarget.current.rx = nx * 2.5;   // rotateY (left/right)
    tiltTarget.current.ry = -ny * 2.5;  // rotateX (up/down, inverted)
    scheduleTilt();
  };

  const resetTilt = () => {
    tiltTarget.current.rx = 0;
    tiltTarget.current.ry = 0;
    scheduleTilt();
  };

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);





  const CategoryGlyph = iconForCategory(feature.category);
  const tint = tintForCategory(feature.category);
  const showMotif = wide && hasFlagshipMotif(feature.id);
  const romanIdx = toRoman(index ?? indexFromId(feature.id));
  const clampedTagline = truncateAtWord(feature.tagline, wide ? 180 : 118);

  // Status pill (Beta / Removed) — modern glowing inset with soft inner shadow.
  const statusPill =
    feature.status === "GA" ? null : (
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-4 z-[2] inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur-md"
        style={
          feature.status === "Beta"
            ? {
                background: "color-mix(in oklab, var(--emerald) 14%, transparent)",
                borderColor: "color-mix(in oklab, var(--emerald) 45%, transparent)",
                color: "color-mix(in oklab, var(--emerald) 30%, var(--cream))",
                boxShadow:
                  "inset 0 1px 0 color-mix(in oklab, var(--emerald) 40%, transparent), 0 0 24px -6px color-mix(in oklab, var(--emerald) 55%, transparent)",
              }
            : {
                background: "rgba(70, 76, 86, 0.28)",
                borderColor: "rgba(150, 158, 172, 0.35)",
                color: "rgba(214, 219, 226, 0.85)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 20px -8px rgba(120,128,142,0.35)",
              }
        }
      >
        <span
          className="size-1 rounded-full"
          style={{
            background: feature.status === "Beta" ? "var(--emerald)" : "rgba(200,206,215,0.75)",
            boxShadow:
              feature.status === "Beta"
                ? "0 0 6px color-mix(in oklab, var(--emerald) 80%, transparent)"
                : "none",
          }}
        />
        {feature.status}
      </span>
    );

  return (
    <div
      className="group"
      style={{
        contentVisibility: "auto",
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
        onMouseLeave={resetTilt}
        onBlur={resetTilt}

        data-cursor="view"
        data-revealed={revealed || undefined}
        data-status={feature.status}
        style={{
          // Per-category tint consumed by .feature-card::before and the
          // watermark glyph. See src/lib/category-theme.ts.
          ["--tint" as string]: tint,
        } as CSSProperties}
        className={
          "feature-card group/card relative flex w-full flex-col gap-4 overflow-hidden rounded-2xl border border-cream/15 bg-muted-ink text-left will-change-transform " +
          (wide ? "p-8 lg:p-10 " : "p-6 ")
        }
      >
        {/* Emerald radial glow bloom — lower-right, refined material feel */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(60% 55% at 85% 90%, color-mix(in oklab, var(--emerald) 18%, transparent), transparent 68%)",
          }}
        />

        {/* Category glyph watermark — authored monoline, lower-right.
            96px on standard cards / 128px on flagship cards. Opacity
            keys off the ambient theme via `.feature-card-glyph`. */}
        <span
          aria-hidden
          className="feature-card-glyph pointer-events-none absolute -bottom-5 -right-4 transition-opacity duration-500"
          style={{ color: tint }}
        >
          <CategoryGlyph
            size={wide ? 128 : 96}
            strokeWidth={1.25}
            aria-hidden
          />
        </span>

        {statusPill}

        {/* Cursor-following gold radial highlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(180px circle at var(--x, 50%) var(--y, 50%), rgba(201,169,97,0.08), transparent 70%)",
          }}
        />

        {/* Editorial eyebrow — mono roman index unifies grid + tarot deck. */}
        <div className="t-label relative flex items-center justify-between gap-3 text-cream/55">
          <span className="flex items-center gap-3">
            <span
              aria-hidden
              className={"inline-block size-1.5 rounded-full " + statusDotClass[feature.status]}
            />
            <span>{feature.category}</span>
            <span
              aria-hidden
              className="hidden font-mono text-[10px] tracking-[0.22em] text-gold/70 sm:inline"
            >
              · {romanIdx}
            </span>
          </span>
          {feature.status === "GA" && (
            <span className={statusTextClass[feature.status]}>{feature.status}</span>
          )}
        </div>

        {showMotif ? (
          <div className="relative grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_180px] lg:grid-cols-[minmax(0,1fr)_200px]">
            <div className="flex min-h-full flex-col gap-3">
              <div className="relative inline-block" style={{ marginTop: "12px" }}>
                <h2 className="fc-title text-cream">{feature.name}</h2>
                <span
                  aria-hidden
                  className={"absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 " + underlineByStatus[feature.status]}
                />
              </div>
              <p className="t-label text-cream/45">{fmtMonthYear(feature.releaseDate)}</p>
              <p className="fc-desc text-cream/70 [text-wrap:pretty] [overflow-wrap:break-word]">
                {clampedTagline}
              </p>
              <div className={"mt-auto flex items-center gap-2 pt-4 text-cream/65 transition-colors " + hoverTextByStatus[feature.status]}>
                <span className="t-meta">View</span>
                <span aria-hidden className="text-base leading-none">→</span>
              </div>
            </div>
            <div className="relative">
              <FlagshipMotif feature={feature} />
            </div>
          </div>
        ) : (
          <div className="relative flex min-h-full flex-col gap-3">
            <div className="relative inline-block" style={{ marginTop: "12px" }}>
              <h2 className="fc-title text-cream">
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
            <p className="fc-desc text-cream/70 [text-wrap:pretty] [overflow-wrap:break-word]">
              {clampedTagline}
            </p>
            <div className={"mt-auto flex items-center gap-2 pt-4 text-cream/65 transition-colors " + hoverTextByStatus[feature.status]}>
              <span className="t-meta">View</span>
              <span aria-hidden className="text-base leading-none">→</span>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}

