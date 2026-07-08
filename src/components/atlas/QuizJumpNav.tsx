import { useEffect, useState } from "react";

interface CategoryStat {
  slug: string;
  category: string;
  checked: number;
  total: number;
}

interface QuizJumpNavProps {
  cats: CategoryStat[];
}

/**
 * Per-category jump nav so 322 rows never feels endless.
 * - Desktop (lg+): slim sticky vertical rail on the left inside the layout.
 * - Mobile/tablet: horizontal scrollable chip strip at the top of the list.
 * Uses IntersectionObserver to highlight the current category as the user
 * scrolls, and scrolls smoothly to the section on click.
 */
export function QuizJumpNav({ cats }: QuizJumpNavProps) {
  const [active, setActive] = useState<string>(cats[0]?.slug ?? "");

  useEffect(() => {
    if (cats.length === 0) return;
    const els = cats
      .map((c) => document.getElementById(`cat-${c.slug}`))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // pick the topmost intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace(/^cat-/, "");
          setActive(id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [cats]);

  function jump(slug: string) {
    const el = document.getElementById(`cat-${slug}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(slug);
  }

  return (
    <>
      {/* Mobile / tablet: horizontal chip strip */}
      <nav
        aria-label="Jump to category"
        className="scrollbar-none sticky top-0 z-20 -mx-5 flex gap-2 overflow-x-auto border-b border-cream/10 bg-ink/85 px-5 py-3 backdrop-blur lg:hidden"
      >
        {cats.map((c) => {
          const isActive = c.slug === active;
          const done = c.checked === c.total;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => jump(c.slug)}
              className={
                "shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors " +
                (isActive
                  ? "border-gold/70 bg-gold/10 text-gold"
                  : done
                    ? "border-emerald/40 text-emerald hover:bg-emerald/10"
                    : "border-cream/15 text-cream/60 hover:border-cream/40 hover:text-cream")
              }
            >
              {c.category}
              <span className="ml-1.5 text-cream/40">
                {c.checked}/{c.total}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Desktop: slim sticky vertical rail */}
      <aside className="sticky top-6 hidden self-start lg:block">
        <div className="flex flex-col gap-0.5 border-l border-cream/10 pl-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40">
            Jump to
          </p>
          {cats.map((c) => {
            const isActive = c.slug === active;
            const done = c.total > 0 && c.checked === c.total;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => jump(c.slug)}
                className={
                  "group relative -ml-4 flex items-center gap-2 border-l-2 py-1 pl-4 pr-2 text-left font-mono text-[11px] tracking-[0.02em] transition-all " +
                  (isActive
                    ? "border-gold text-gold"
                    : done
                      ? "border-transparent text-emerald/85 hover:border-emerald/60"
                      : "border-transparent text-cream/55 hover:border-cream/30 hover:text-cream")
                }
              >
                <span className="flex-1 truncate">{c.category}</span>
                <span className="shrink-0 text-[10px] text-cream/40">
                  {c.checked}/{c.total}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
