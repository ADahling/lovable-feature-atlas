import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

function Counter({ target, delay = 0 }: { target: number; delay?: number }) {
  const [value, setValue] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    let cancelled = false;
    const startTimer = window.setTimeout(() => {
      const start = performance.now();
      const duration = 600;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / duration);
        setValue(Math.round(ease(t) * target));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(startTimer);
    };
  }, [target, delay, reduced]);

  return <span className="t-counter text-cream tabular-nums">{value}</span>;
}

interface StatCountersProps {
  total: number;
  categories: number;
  ga: number;
  /** ms delay before counters begin (matches hero choreography). */
  startDelay?: number;
}

export function StatCounters({ total, categories, ga, startDelay = 0 }: StatCountersProps) {
  const tiles: Array<{ label: string; value: number }> = [
    { label: "Features", value: total },
    { label: "Categories", value: categories },
    { label: "GA", value: ga },
  ];
  return (
    <div className="flex items-stretch">
      {tiles.map((t, i) => (
        <div
          key={t.label}
          className={
            "flex flex-col gap-3 px-6 first:pl-0 " +
            (i < tiles.length - 1 ? "border-r border-cream/15" : "")
          }
        >
          <Counter target={t.value} delay={startDelay} />
          <span className="t-label text-cream/55">{t.label}</span>
        </div>
      ))}
    </div>
  );
}
