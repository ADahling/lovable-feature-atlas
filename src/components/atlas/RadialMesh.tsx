import { motion } from "framer-motion";

export function RadialMesh() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        opacity: 0.28,
        mixBlendMode: "screen",
        backgroundImage: [
          // Soft violet aura, upper-left
          "radial-gradient(48% 38% at 22% 18%, var(--lovable-violet) 0%, transparent 70%)",
          // Pink whisper, lower-right
          "radial-gradient(42% 34% at 80% 78%, var(--lovable-pink) 0%, transparent 72%)",
          // Deep ink vignette anchoring the composition
          "radial-gradient(85% 70% at 50% 55%, var(--ink) 0%, transparent 80%)",
        ].join(","),
        backgroundSize: "140% 140%, 140% 140%, 160% 160%",
      }}
      animate={{
        backgroundPosition: [
          "0% 0%, 100% 100%, 60% 30%, 50% 50%",
          "100% 40%, 0% 60%, 40% 70%, 30% 70%",
          "50% 100%, 50% 0%, 70% 50%, 70% 30%",
          "0% 0%, 100% 100%, 60% 30%, 50% 50%",
        ],
      }}
      transition={{ duration: 38, ease: "linear", repeat: Infinity }}
    />
  );
}
