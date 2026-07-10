/**
 * CategorySpark — a restrained particle burst rendered when a quiz
 * category flips from incomplete to complete. Absolutely positioned
 * inside its parent (`relative`), pointer-events-none, self-removes
 * via CSS animation. Skipped by the caller under prefers-reduced-motion.
 */
export function CategorySpark() {
  // 10 sparks radiating from left of the row header.
  const sparks = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const dist = 22 + (i % 3) * 6;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const size = i % 2 === 0 ? 3 : 2;
    const color = i % 3 === 0 ? "var(--gold)" : "var(--emerald)";
    return { dx, dy, size, color, delay: (i % 5) * 20 };
  });
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-0 top-1/2 z-[1] -translate-y-1/2"
      style={{ width: 1, height: 1 }}
    >
      {sparks.map((s, i) => (
        <span
          key={i}
          className="absolute left-0 top-0 rounded-full"
          style={{
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow: `0 0 6px ${s.color}`,
            animation: `atlas-cat-spark 700ms ${s.delay}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
            // Custom props consumed by the keyframes.
            ["--dx" as string]: `${s.dx}px`,
            ["--dy" as string]: `${s.dy}px`,
          }}
        />
      ))}
    </span>
  );
}
