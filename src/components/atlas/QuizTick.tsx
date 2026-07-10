import { useEffect, useRef, useState } from "react";

interface QuizTickProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}

/**
 * Bespoke tick control:
 * - Real <input type="checkbox"> visually hidden for a11y + keyboard.
 * - SVG check drawn with a 200ms stroke animation (dash-offset transition).
 * - Two-stage pop bounce on tick (overshoot → settle) for a tactile feel.
 *   Skipped under prefers-reduced-motion.
 */
export function QuizTick({ id, checked, onChange, label }: QuizTickProps) {
  const [pop, setPop] = useState<"idle" | "over" | "settle">("idle");
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function handleChange() {
    onChange();
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    clearTimers();
    setPop("over");
    timers.current.push(
      window.setTimeout(() => setPop("settle"), 130),
      window.setTimeout(() => setPop("idle"), 260),
    );
  }

  useEffect(() => () => clearTimers(), []);

  const scaleClass =
    pop === "over" ? "scale-[1.28]" : pop === "settle" ? "scale-[0.94]" : "scale-100";

  return (
    <span className="relative inline-flex shrink-0">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        aria-label={label}
        className="peer absolute inset-0 size-full cursor-pointer opacity-0 focus-visible:outline-none"
      />
      <span
        aria-hidden
        className={
          "relative flex size-5 items-center justify-center rounded-[5px] border transition-all duration-150 ease-out " +
          "peer-focus-visible:ring-2 peer-focus-visible:ring-gold/70 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink " +
          (checked
            ? "border-emerald bg-emerald shadow-[0_0_0_1px_rgba(31,122,90,0.35),0_6px_18px_-8px_rgba(31,122,90,0.7)]"
            : "border-cream/25 bg-transparent hover:border-emerald/60") +
          " " + scaleClass
        }
        style={{ transitionProperty: "transform, background-color, border-color, box-shadow" }}
      >
        <svg
          viewBox="0 0 16 16"
          className="size-3.5"
          fill="none"
          stroke="#0A0A0A"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline
            points="3.5 8.6 6.7 11.6 12.5 5.2"
            style={{
              strokeDasharray: 16,
              strokeDashoffset: checked ? 0 : 16,
              transition: "stroke-dashoffset 200ms cubic-bezier(0.65, 0, 0.35, 1)",
              transitionDelay: checked ? "40ms" : "0ms",
            }}
          />
        </svg>
      </span>
    </span>
  );
}
