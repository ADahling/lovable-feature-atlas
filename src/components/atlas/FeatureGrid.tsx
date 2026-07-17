import type { FeatureCard as Feature } from "../../lib/features.functions";
import { FeatureCard } from "./EditorialFeatureCard";

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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
      {features.map((feature, index) => {
        const wide = FLAGSHIP_IDS.has(feature.id);
        return (
          <div
            key={feature.id}
            data-fg-key={feature.id}
            className={wide ? "min-w-0 md:col-span-2 xl:col-span-2" : "min-w-0"}
          >
            <FeatureCard
              feature={feature}
              wide={wide}
              index={index + 1}
              onClick={() => onSelect(feature)}
            />
          </div>
        );
      })}
    </div>
  );
}
