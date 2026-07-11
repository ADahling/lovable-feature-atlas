import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useFeatures } from "../../hooks/use-features";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useTheme } from "../../hooks/use-theme";
import { tintForCategory } from "../../lib/category-theme";

/**
 * Cinematic-to-utility bridge — three thin filaments descend from the
 * hero constellation and resolve into category-accent-colored dividers
 * over the catalog area, so the hero's atmosphere flows into the working
 * layer rather than hard-stopping at the fold. Desktop dark only.
 */
export function HeroCatalogBridge() {
  const { features } = useFeatures();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const theme = useTheme();
  const reduced = useReducedMotion() ?? false;
  // Session flag mirrors Hero.tsx: after the first dark-mode entry this
  // session, atmosphere layers reappear instantly on theme re-entry
  // instead of replaying the full 1.4s filament draw.
  const skipEntrance =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem("atlas.hero-entered-session") === "1";

  const paths = useMemo(() => {
    const seen: string[] = [];
    for (const f of features) {
      if (!seen.includes(f.category)) seen.push(f.category);
      if (seen.length >= 3) break;
    }
    // xs are chosen to span the width so the eye connects them to the
    // catalog rule below. Curves lean inward for a subtle funnel feel.
    return [
      { x1: 22, x2: 24, color: tintForCategory(seen[0] ?? "Platform") },
      { x1: 51, x2: 50, color: tintForCategory(seen[1] ?? "Editor") },
      { x1: 78, x2: 76, color: tintForCategory(seen[2] ?? "AI Models") },
    ];
  }, [features]);

  if (!isDesktop || theme !== "dark") return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none relative -mt-16 h-24 w-full overflow-hidden"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {paths.map((p, i) => (
          <motion.path
            key={i}
            d={`M ${p.x1} 0 C ${p.x1} 40, ${p.x2} 55, ${p.x2} 100`}
            stroke={p.color}
            strokeWidth={0.25}
            fill="none"
            strokeLinecap="round"
            initial={reduced ? { pathLength: 1, opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.55 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: reduced ? 0 : 1.4,
              delay: reduced ? 0 : 0.1 + i * 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </svg>
      {/* Resolve into a thin cream hairline that lines up with the command
          bar's top edge — the eye reads the filaments as descending INTO
          the utility layer. */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(251,245,233,0) 0%, rgba(251,245,233,0.14) 25%, rgba(251,245,233,0.22) 50%, rgba(251,245,233,0.14) 75%, rgba(251,245,233,0) 100%)",
        }}
      />
    </div>
  );
}
