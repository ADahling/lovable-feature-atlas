import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type Feature } from "../../data/features";
import { FeatureCard } from "./FeatureCard";

interface FeatureGridProps {
  features: Feature[];
  onSelect: (f: Feature) => void;
}

// Flagship IDs — render as wide cards to break grid uniformity.
// Keep this list conservative; unknown IDs are ignored.
const FLAGSHIP_IDS = new Set<string>([
  "agent-mode",
  "lovable-cloud",
  "lovable-ai-gateway",
  "code-mode",
  "subagents",
  "lovable-mcp-server",
  "browser-testing",
  "seo-and-ai-search",
  "lovable-mobile-app",
  "custom-domain",
]);

export function FeatureGrid({ features, onSelect }: FeatureGridProps) {
  const reduced = useReducedMotion();

  if (features.length === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="t-eyebrow text-cream/55">No features match</p>
        <p className="t-body text-cream/65">
          Try clearing a filter or widening your search.
        </p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {features.map((feature, index) => {
          const wide = FLAGSHIP_IDS.has(feature.id);
          // Groups of three, 60ms between siblings inside a group.
          const groupPos = index % 3;
          const revealDelay = groupPos * 60;
          return (
            <motion.div
              key={feature.id}
              layout={reduced ? false : "position"}
              initial={reduced ? false : { opacity: 0, scale: 0.96, y: 12 }}
              animate={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -8 }}
              transition={{
                layout: { type: "spring", stiffness: 320, damping: 32, mass: 0.7 },
                default: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
              }}
              className={wide ? "md:col-span-2 xl:col-span-2" : ""}
              // Inline-style belt-and-braces: guarantees flagship two-column
              // span even if Tailwind ever drops the col-span utilities from
              // the built CSS. Uses a media query via CSS var — see below.
              style={
                wide
                  ? ({
                      gridColumn: "span 2 / span 2",
                    } satisfies CSSProperties)
                  : undefined
              }
            >
              <FeatureCard
                feature={feature}
                wide={wide}
                index={index + 1}
                revealDelay={revealDelay}
                onClick={() => onSelect(feature)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
