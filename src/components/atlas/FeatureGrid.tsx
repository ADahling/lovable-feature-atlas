import { motion } from "framer-motion";
import { type Feature } from "../../data/features";
import { FeatureCard } from "./FeatureCard";

interface FeatureGridProps {
  features: Feature[];
  onSelect: (f: Feature) => void;
}

export function FeatureGrid({ features, onSelect }: FeatureGridProps) {
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
