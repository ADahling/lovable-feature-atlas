import { useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCard as Feature } from "../../lib/features.functions";
import { fmtMonthDayYearUTC, fmtMonthYearFromKeyUTC } from "../../lib/format-date";
import { categoryAccentVar } from "../../lib/category-theme";

interface TimelineViewProps {
  features: Feature[];
  onSelect: (f: Feature) => void;
}

const fmtMonthYearKey = fmtMonthYearFromKeyUTC;
const fmtDateShort = fmtMonthDayYearUTC;

const statusDotClass: Record<Feature["status"], string> = {
  GA: "bg-emerald",
  Beta: "bg-gold",
  Removed: "bg-cream/40",
};

const statusPillStyles: Record<Feature["status"], string> = {
  GA: "text-emerald",
  Beta: "text-gold",
  Removed: "text-cream/55",
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Rise-into-view via IntersectionObserver — once, skipped when reduced. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
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
  return { ref, revealed };
}

function MonthMarker({
  label,
  count,
  weight,
  active,
}: {
  label: string;
  count: number;
  weight: number;
  active: boolean;
}) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  // Weight: 0..1 → visual density (larger dot, bolder ring for heavy months).
  const baseSize = 10 + Math.round(weight * 10); // 10..20 px
  const size = active ? baseSize + 6 : baseSize;
  return (
    <div ref={ref} className="relative flex items-center gap-4">
      {/* Filled circle marker — scales up on scroll-in and again when
          this month is nearest the viewport center. */}
      <span
        aria-hidden
        className="relative z-10 -ml-[1px] flex items-center justify-center rounded-full bg-ink"
        style={{
          transition: "transform 500ms cubic-bezier(0.22,1,0.36,1), opacity 400ms",
          transform: revealed ? (active ? "scale(1.08)" : "scale(1)") : "scale(0.4)",
          opacity: revealed ? 1 : 0,
        }}
      >
        <span
          className="rounded-full"
          style={{
            width: size,
            height: size,
            background: active ? "var(--gold)" : "transparent",
            border: active ? "none" : "1.5px solid var(--gold)",
            transition:
              "background-color 260ms cubic-bezier(0.22,1,0.36,1), width 260ms cubic-bezier(0.22,1,0.36,1), height 260ms cubic-bezier(0.22,1,0.36,1), box-shadow 260ms",
            boxShadow: active
              ? `0 0 0 ${Math.round(weight * 8 + 6)}px color-mix(in oklab, var(--gold) 22%, transparent)`
              : `0 0 0 ${Math.round(weight * 4 + 2)}px color-mix(in oklab, var(--gold) 8%, transparent)`,
          }}
        />
      </span>
      <h2
        className="font-mono uppercase text-gold whitespace-nowrap m-0"
        style={{
          fontSize: active ? 15 : weight > 0.5 ? 14 : 12,
          letterSpacing: "0.16em",
          transition: "font-size 260ms cubic-bezier(0.22,1,0.36,1), color 260ms",
        }}
      >
        {label}
      </h2>
      <span aria-hidden className="h-px flex-1 bg-emerald/15" />
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/45">
        {count} release{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function TimelineItem({
  feature,
  onSelect,
  delay,
}: {
  feature: Feature;
  onSelect: (f: Feature) => void;
  delay: number;
}) {
  const { ref, revealed } = useReveal<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(feature)}
      data-cursor="view"
      style={{
        transition:
          "transform 400ms cubic-bezier(0.22,1,0.36,1), opacity 400ms cubic-bezier(0.22,1,0.36,1), border-color 250ms, background-color 250ms",
        transitionDelay: revealed ? `${delay}ms` : "0ms",
        transform: revealed ? "translate3d(0,0,0)" : "translate3d(-12px,0,0)",
        opacity: revealed ? 1 : 0,
      }}
      className="group relative flex w-full min-h-[80px] flex-col gap-3 rounded-xl border border-emerald/20 bg-muted-ink/40 px-5 py-4 text-left hover:border-emerald/60 hover:bg-muted-ink/70 sm:flex-row sm:items-center sm:gap-4"
    >
      {/* Connector line from spine to card — tinted with the feature's
          category accent so timeline rows are scannable by category color. */}
      <span
        aria-hidden
        className="absolute -left-6 top-6 h-px w-6 sm:top-1/2 sm:-translate-y-1/2"
        style={{ backgroundColor: categoryAccentVar(feature.category), opacity: 0.55 }}
      />
      {/* Rail node — status color, ringed by the page background. */}
      <span
        aria-hidden
        className={
          "absolute -left-[30px] top-6 sm:top-1/2 sm:-translate-y-1/2 size-2 rounded-full ring-4 ring-ink " +
          statusDotClass[feature.status]
        }
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="t-card text-cream line-clamp-3 [overflow-wrap:normal] [word-break:normal] hyphens-none">
          {feature.name}
        </h3>
        <p className="t-body-sm text-cream/65 line-clamp-3 [overflow-wrap:anywhere]">
          {feature.tagline}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
        <span
          className={
            "font-mono text-[11px] uppercase tracking-wider " + statusPillStyles[feature.status]
          }
        >
          {feature.status}
        </span>
        <span className="font-mono text-[11px] text-cream/55">
          {fmtDateShort(feature.releaseDate)}
        </span>
        <span aria-hidden className="ml-auto text-cream/30 transition-colors group-hover:text-emerald sm:ml-2">
          →
        </span>
      </div>
    </button>
  );
}

export function TimelineView({ features, onSelect }: TimelineViewProps) {
  const groups = useMemo(() => {
    const ordered: string[] = [];
    const map = new Map<string, Feature[]>();
    for (const f of features) {
      const key = f.releaseDate.slice(0, 7);
      if (!map.has(key)) {
        map.set(key, []);
        ordered.push(key);
      }
      map.get(key)!.push(f);
    }
    return ordered.map((key) => ({ key, items: map.get(key)! }));
  }, [features]);

  const maxCount = useMemo(
    () => groups.reduce((m, g) => Math.max(m, g.items.length), 1),
    [groups],
  );

  if (features.length === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="t-eyebrow text-cream/55">No features match</p>
        <p className="t-body text-cream/65">
          Try clearing a filter or widening your search.
        </p>
      </div>
    );

  // Track which month marker is nearest the viewport vertical center as
  // the user scrolls, so it becomes the "live position" indicator.
  const markerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    markerRefs.current = markerRefs.current.slice(0, groups.length);
    if (typeof window === "undefined") return;
    let raf = 0;
    const compute = () => {
      const center = window.innerHeight / 2;
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < markerRefs.current.length; i++) {
        const el = markerRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - center);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      setActiveIndex(bestIdx);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        compute();
      });
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [groups.length]);

  return (
    <div data-atlas-timeline className="relative flex flex-col gap-14 pl-[14px] sm:pl-[18px]">
      {/* Persistent vertical spine — 1px gold gradient */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-2 bottom-2 w-px"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--gold) 6%, transparent) 0%, color-mix(in oklab, var(--gold) 55%, transparent) 12%, color-mix(in oklab, var(--gold) 45%, transparent) 82%, color-mix(in oklab, var(--gold) 6%, transparent) 100%)",
        }}
      />
      {groups.map((group, gi) => {
        const weight = Math.min(1, group.items.length / Math.max(maxCount, 4));
        return (
          <section key={group.key} className="relative flex flex-col gap-6">
            <div ref={(el) => { markerRefs.current[gi] = el; }}>
              <MonthMarker
                label={fmtMonthYearKey(group.key)}
                count={group.items.length}
                weight={weight}
                active={gi === activeIndex}
              />
            </div>
            <div className="relative flex flex-col gap-3 pl-6">
              {group.items.map((feature, ii) => (
                <TimelineItem
                  key={feature.id}
                  feature={feature}
                  onSelect={onSelect}
                  delay={Math.min(ii, 6) * 45}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
