import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface CounterState {
  value: number;
  progress: number; // 0..1 — drives the underline draw-in
}

/**
 * One-shot count-up. Runs once on mount from 0 → target. Prop changes to
 * `target` after mount update the resting value but do NOT restart the
 * animation (avoids re-trigger loops from parent re-renders).
 */
function useEntranceCounter(target: number, delay: number): CounterState {
  // Start pre-filled at ~92% of target so mid-roll reads never look like a
  // data error — the count-up only fills in the last handful of units.
  const seed = Math.max(0, Math.round(target * 0.92));
  const [state, setState] = useState<CounterState>({ value: seed, progress: 0.92 });
  const reduced = useReducedMotion();
  const startedRef = useRef(false);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    if (startedRef.current) {
      // Keep resting value in sync if the target changes post-animation.
      setState((s) => (s.progress >= 1 ? { value: target, progress: 1 } : s));
      return;
    }
    startedRef.current = true;

    if (reduced) {
      setState({ value: target, progress: 1 });
      return;
    }
    let raf = 0;
    let cancelled = false;
    const startTimer = window.setTimeout(() => {
      const start = performance.now();
      const duration = 520;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const from = Math.max(0, Math.round(targetRef.current * 0.92));
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const e = ease(t);
        setState({
          value: Math.round(from + e * (targetRef.current - from)),
          progress: 0.92 + e * 0.08,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduced]);

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
