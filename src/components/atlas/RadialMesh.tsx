import { motion } from "framer-motion";

export function RadialMesh() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        opacity: 0.4,
        mixBlendMode: "screen",
        backgroundImage: [
          "radial-gradient(60% 50% at 20% 30%, #0B3D2E 0%, transparent 60%)",
          "radial-gradient(55% 45% at 80% 70%, #1F7A5A 0%, transparent 60%)",
          "radial-gradient(70% 60% at 50% 50%, #0A0A0A 0%, transparent 70%)",
        ].join(","),
        backgroundSize: "120% 120%, 120% 120%, 140% 140%",
      }}
      animate={{
        backgroundPosition: [
          "0% 0%, 100% 100%, 50% 50%",
          "100% 50%, 0% 50%, 30% 70%",
          "50% 100%, 50% 0%, 70% 30%",
          "0% 0%, 100% 100%, 50% 50%",
        ],
      }}
      transition={{ duration: 30, ease: "linear", repeat: Infinity }}
    />
  );
}
