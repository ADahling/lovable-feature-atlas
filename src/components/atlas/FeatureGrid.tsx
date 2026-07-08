import type { CSSProperties } from "react";
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
      {features.map((feature, index) => {
        const wide = FLAGSHIP_IDS.has(feature.id);
        // Groups of three, 60ms between siblings inside a group.
        const groupPos = index % 3;
        const revealDelay = groupPos * 60;
        return (
          <div
            key={feature.id}
            className={wide ? "md:col-span-2 xl:col-span-2" : ""}
            // Inline-style belt-and-braces: guarantees flagship two-column
            // span even if Tailwind ever drops the col-span utilities from
            // the built CSS. Uses a media query via CSS var — see below.
            style={
              wide
                ? ({
                    // Fallback grid span applied unconditionally; the
                    // parent grid only exposes column 2/3 above md/xl, so
                    // span-2 is harmless at smaller widths.
                    gridColumn: "span 2 / span 2",
                  } satisfies CSSProperties)
                : undefined
            }
          >
            <FeatureCard
              feature={feature}
              wide={wide}
              revealDelay={revealDelay}
              onClick={() => onSelect(feature)}
            />
          </div>
        );
      })}
    </div>
  );
}
