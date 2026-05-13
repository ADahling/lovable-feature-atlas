import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

function Counter({ target }: { target: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const controls = animate(mv, target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [mv, target]);
  return (
    <motion.span
      style={{
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: "48px",
        lineHeight: 1,
        color: "var(--gold)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {rounded}
    </motion.span>
  );
}

interface StatCountersProps {
  total: number;
  categories: number;
  ga: number;
}

export function StatCounters({ total, categories, ga }: StatCountersProps) {
  const tiles: Array<{ label: string; value: number }> = [
    { label: "Features", value: total },
    { label: "Categories", value: categories },
    { label: "GA", value: ga },
  ];
  return (
    <div className="flex gap-10">
      {tiles.map((t) => (
        <div key={t.label} className="flex flex-col gap-3">
          <Counter target={t.value} />
          <span
            className="font-sans text-cream"
            style={{
              fontSize: "12px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            {t.label}
          </span>
        </div>
      ))}
    </div>
  );
}
