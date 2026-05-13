import { motion } from "framer-motion";

export function RadialMesh() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        opacity: 0.55,
        mixBlendMode: "screen",
        backgroundImage: [
          // Lovable pink wash, top-left
          "radial-gradient(55% 45% at 18% 24%, var(--lovable-pink) 0%, transparent 62%)",
          // Lovable violet glow, bottom-right
          "radial-gradient(50% 42% at 82% 76%, var(--lovable-violet) 0%, transparent 60%)",
          // Magenta midpoint whisper
          "radial-gradient(35% 28% at 70% 40%, var(--lovable-magenta) 0%, transparent 70%)",
          // Deep ink vignette to keep contrast under the headline
          "radial-gradient(75% 65% at 30% 55%, var(--ink) 0%, transparent 72%)",
        ].join(","),
        backgroundSize: "130% 130%, 130% 130%, 110% 110%, 150% 150%",
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
