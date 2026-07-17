import { useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FeatureCard as Feature } from "../../lib/features.functions";
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

  // Stagger only on initial page paint. Subsequent filter/sort changes reuse
  // the same grid instance; we flip the ref after the first render pass so
  // late-arriving cards from filters don't re-cascade.
  const hasStaggeredRef = useRef(false);
  const shouldStagger = !hasStaggeredRef.current;
  // Set after commit so the initial render still sees `true`.
  useMemo(() => {
    // no-op memo; effect below flips ref
    return null;
  }, []);
  // Flip on next microtask so the current render batch benefits from stagger.
  if (typeof window !== "undefined" && shouldStagger) {
    queueMicrotask(() => {
      hasStaggeredRef.current = true;
    });
  }

  // Build a per-category lookup so each card can preview 3 siblings without
  // scanning the full list on every hover.
  const relatedByCategory = useMemo(() => {
    const map = new Map<string, Feature[]>();
    for (const f of features) {
      const bucket = map.get(f.category) ?? [];
      bucket.push(f);
      map.set(f.category, bucket);
    }
    return map;
  }, [features]);

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
          const groupPos = index % 3;
          const revealDelay = shouldStagger ? groupPos * 0.06 : 0;
          const siblings = (relatedByCategory.get(feature.category) ?? []).filter(
            (f) => f.id !== feature.id,
          ).slice(0, 3);
          return (
            <motion.div
              key={feature.id}
              layout={reduced ? false : "position"}
              initial={reduced || !shouldStagger ? false : { opacity: 0, y: 14 }}
              whileInView={reduced || !shouldStagger ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px 0px -60px 0px" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -8 }}
              transition={{
                layout: { type: "spring", stiffness: 320, damping: 32, mass: 0.7 },
                default: { duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: revealDelay },
              }}
              // Clear framer-set inline transform after layout settles so a
              // stale FLIP translate can't strand a card in empty space.
              onLayoutAnimationComplete={() => {
                if (typeof document === "undefined") return;
                const el = document.querySelector<HTMLElement>(
                  `[data-fg-key="${feature.id}"]`,
                );
                if (el) el.style.transform = "";
              }}
              data-fg-key={feature.id}
              className={wide ? "min-w-0 md:col-span-2 xl:col-span-2" : "min-w-0"}
            >
              <FeatureCard
                feature={feature}
                wide={wide}
                index={index + 1}
                onClick={() => onSelect(feature)}
                related={siblings}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
