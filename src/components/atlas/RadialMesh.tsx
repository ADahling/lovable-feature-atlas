import { motion } from "framer-motion";

export function RadialMesh() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        opacity: 0.32,
        mixBlendMode: "screen",
        backgroundImage: [
          // Pink — upper-left primary
          "radial-gradient(46% 38% at 22% 18%, color-mix(in oklab, var(--lovable-pink) 70%, transparent) 0%, transparent 70%)",
          // Magenta — center bridge stop
          "radial-gradient(40% 32% at 52% 48%, color-mix(in oklab, var(--lovable-magenta) 55%, transparent) 0%, transparent 72%)",
          // Violet — lower-right anchor
          "radial-gradient(48% 38% at 80% 78%, color-mix(in oklab, var(--lovable-violet) 70%, transparent) 0%, transparent 70%)",
          // Ink vignette holds the composition
          "radial-gradient(85% 70% at 50% 55%, var(--ink) 0%, transparent 80%)",
        ].join(","),
        backgroundSize: "140% 140%, 150% 150%, 140% 140%, 160% 160%",
      }}
      animate={{
        backgroundPosition: [
          "0% 0%, 50% 50%, 100% 100%, 50% 50%",
          "60% 30%, 50% 50%, 30% 70%, 50% 50%",
          "0% 0%, 50% 50%, 100% 100%, 50% 50%",
        ],
      }}
      transition={{ duration: 48, ease: "linear", repeat: Infinity }}
    />
  );
}
