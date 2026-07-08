import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface CounterState {
  value: number;
  progress: number; // 0..1 — drives the underline draw-in
}

function useEntranceCounter(target: number, delay: number): CounterState {
  const [state, setState] = useState<CounterState>({ value: target, progress: 1 });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setState({ value: target, progress: 1 });
      return;
    }
    setState({ value: 0, progress: 0 });
    let raf = 0;
    let cancelled = false;
    const startTimer = window.setTimeout(() => {
      const start = performance.now();
      const duration = 1200;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / duration);
        const e = ease(t);
        setState({
          value: Math.round(e * target),
          progress: e,
        });
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

  return state;
}

function Counter({ target, delay = 0 }: { target: number; delay?: number }) {
  const { value, progress } = useEntranceCounter(target, delay);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="t-counter text-cream tabular-nums tracking-[-0.03em]">
        {value}
      </span>
      {/* Hairline gold accent — draws in during count-up, ~28px wide when full */}
      <span
        aria-hidden
        className="h-px w-7 origin-left"
        style={{
          background: "var(--gold)",
          transform: `scaleX(${progress})`,
          transition: "transform 120ms linear",
          opacity: 0.85,
        }}
      />
    </div>
  );
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
          <Counter target={t.value} delay={startDelay + i * 90} />
          <span className="t-label text-cream/55">{t.label}</span>
        </div>
      ))}
    </div>
  );
}
