import { motion } from "framer-motion";
import { type Feature } from "../../data/features";
import { FeatureCard } from "./FeatureCard";

interface FeatureGridProps {
  features: Feature[];
  onSelect: (f: Feature) => void;
}

export function FeatureGrid({ features, onSelect }: FeatureGridProps) {
  if (features.length === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/55">
          No features match
        </p>
        <p className="font-sans text-[14px] text-cream/65">
          Try clearing a filter or widening your search.
        </p>
      </div>
    );
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      {features.map((feature, index) => (
        <motion.div
          key={feature.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.5,
            delay: index * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <FeatureCard feature={feature} onClick={() => onSelect(feature)} />
        </motion.div>
      ))}
    </div>
  );
}
