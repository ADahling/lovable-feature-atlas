import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { FeatureCard as Feature } from "../../lib/features.functions";
import { categoryAccentVar } from "../../lib/category-theme";
import { fmtMonthDayYearUTC } from "../../lib/format-date";

const ROW_H = 44;
const OVERSCAN = 14;

const STATUS_LABEL: Record<Feature["status"], string> = {
  GA: "GA",
  Beta: "Beta",
  Removed: "Retired",
};

const STATUS_CLASS: Record<Feature["status"], string> = {
  GA: "border-emerald/40 text-emerald",
  Beta: "border-gold-deep/50 text-gold",
  Removed: "border-line text-cream/60",
};

/**
 * The compact catalog list — all matching rows, virtualized against the
 * window scroll (~40 rendered at a time), no pagination. 44px single-line
 * rows; j/k move the active row, Enter opens it, and focus follows so
 * keyboard and screen-reader order stay coherent.
 */
export function FeatureListVirtual({ features }: { features: Feature[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<number, HTMLAnchorElement>());
  const [range, setRange] = useState({ start: 0, end: 40 });
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const router = useRouter();

  const total = features.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const start = Math.max(0, Math.floor(-rect.top / ROW_H) - OVERSCAN);
      const visibleCount = Math.ceil(viewH / ROW_H) + OVERSCAN * 2;
      const end = Math.min(total, start + visibleCount);
      setRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [total]);

  // Reset the active row when the result set changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [features]);

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const moveActive = useCallback(
    (delta: number) => {
      const prev = activeIndexRef.current;
      const next = Math.min(total - 1, Math.max(0, (prev < 0 ? (delta > 0 ? -1 : 0) : prev) + delta));
      setActiveIndex(next);
      const el = containerRef.current;
      if (el) {
        const rowTop = el.getBoundingClientRect().top + window.scrollY + next * ROW_H;
        const viewTop = window.scrollY + 120;
        const viewBottom = window.scrollY + window.innerHeight - 96;
        if (rowTop < viewTop) window.scrollTo({ top: rowTop - 132 });
        else if (rowTop + ROW_H > viewBottom)
          window.scrollTo({ top: rowTop + ROW_H + 96 - window.innerHeight });
      }
      // Focus follows selection, so Enter activates the row's own anchor —
      // the handler below never synthesizes navigation itself.
      window.requestAnimationFrame(() => {
        rowRefs.current.get(next)?.focus({ preventScroll: true });
      });
    },
    [total],
  );

  // j / k — active only while the list is mounted; never while typing,
  // while a modifier chord is held, while the palette overlay is open, or
  // while focus sits on an unrelated interactive control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "j" && e.key !== "k") return;
      if (document.body.dataset.paletteOpen === "true") return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable)
          return;
        const container = containerRef.current;
        const interactive = target.closest("a, button, [role='button'], [role='dialog']");
        if (interactive && container && !container.contains(interactive)) return;
      }
      e.preventDefault();
      moveActive(e.key === "j" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveActive]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="t-eyebrow text-cream/60">No features match</p>
        <p className="t-body text-cream/70">Try clearing a filter or widening your search.</p>
      </div>
    );
  }

  const slice = features.slice(range.start, range.end);

  return (
    <div>
      <p className="sr-only">
        Keyboard: press j and k to move between rows, Enter to open the active feature.
      </p>
      <div
        ref={containerRef}
        aria-label={`${total} features`}
        className="relative border-y border-line"
        style={{ height: total * ROW_H }}
      >
        {slice.map((f, i) => {
          const index = range.start + i;
          const accent = categoryAccentVar(f.category);
          const isActive = index === activeIndex;
          return (
            <a
              key={f.id}
              ref={(el) => {
                if (el) rowRefs.current.set(index, el);
                else rowRefs.current.delete(index);
              }}
              href={`/features/${f.id}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveIndex(index);
                void navigate({ to: "/features/$slug", params: { slug: f.id } });
              }}
              onFocus={() => {
                setActiveIndex(index);
                void router.preloadRoute({ to: "/features/$slug", params: { slug: f.id } });
              }}
              onPointerEnter={() => {
                void router.preloadRoute({ to: "/features/$slug", params: { slug: f.id } });
              }}
              className={
                "absolute inset-x-0 flex items-center gap-3 border-b border-line px-3 font-mono text-[12px] outline-none transition-colors sm:gap-4 sm:px-4 " +
                (isActive
                  ? "bg-parchment"
                  : "bg-transparent hover:bg-parchment/60 focus-visible:bg-parchment")
              }
              style={{ top: index * ROW_H, height: ROW_H }}
            >
              <span aria-hidden className="shrink-0 text-[13px] leading-none text-gold-metal">
                ✦
              </span>
              <span className="min-w-0 flex-1 truncate font-sans text-[13.5px] font-medium text-cream sm:text-[14px]">
                {f.name}
              </span>
              <span
                className="hidden shrink-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] md:inline-flex"
                style={{ color: accent }}
              >
                <span
                  aria-hidden
                  className="inline-block size-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                {f.category}
              </span>
              <span
                className={`inline-flex w-[64px] shrink-0 items-center justify-center rounded-sm border px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] ${STATUS_CLASS[f.status]}`}
              >
                {STATUS_LABEL[f.status]}
              </span>
              <span className="hidden w-[104px] shrink-0 text-right text-[10.5px] uppercase tracking-[0.1em] tabular-nums text-cream/65 sm:inline">
                {fmtMonthDayYearUTC(f.releaseDate)}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
