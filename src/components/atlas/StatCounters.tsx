import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

function Counter({ target }: { target: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const controls = animate(mv, target, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [mv, target]);
  return (
    <motion.span
      className="t-counter"
      style={{
        backgroundImage: "var(--gradient-brand)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
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
    <div className="flex items-stretch">
      {tiles.map((t, i) => (
        <div
          key={t.label}
          className={
            "flex flex-col gap-3 px-6 first:pl-0 " +
            (i < tiles.length - 1 ? "border-r border-cream/10" : "")
          }
        >
          <Counter target={t.value} />
          <span className="t-label text-cream/55">{t.label}</span>
        </div>
      ))}
    </div>
  );
}
