import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/use-theme";

/**
 * Ambient hero backdrop. Dark theme: emerald/gold radial mesh over ink.
 * Light theme: warm paper-grain + soft amber radial glow on cream.
 */
export function RadialMesh() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;


  if (theme === "light") {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Warm amber radial glow, upper-right */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "radial-gradient(55% 45% at 78% 22%, color-mix(in oklab, #E8B96B 45%, transparent) 0%, transparent 72%)",
              "radial-gradient(48% 40% at 18% 78%, color-mix(in oklab, #8E7434 22%, transparent) 0%, transparent 70%)",
              "radial-gradient(90% 70% at 50% 55%, transparent 40%, color-mix(in oklab, #C7B58A 22%, transparent) 100%)",
            ].join(","),
            opacity: 0.9,
          }}
        />
        {/* Paper grain — SVG turbulence, low-opacity multiply */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.35,
            mixBlendMode: "multiply",
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.42  0 0 0 0 0.34  0 0 0 0 0.22  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            backgroundSize: "320px 320px",
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        opacity: 0.32,
        mixBlendMode: "screen",
        backgroundImage: [
          "radial-gradient(46% 38% at 22% 18%, color-mix(in oklab, var(--forest) 90%, transparent) 0%, transparent 70%)",
          "radial-gradient(40% 32% at 52% 48%, color-mix(in oklab, var(--emerald) 55%, transparent) 0%, transparent 72%)",
          "radial-gradient(48% 38% at 80% 78%, color-mix(in oklab, var(--gold) 35%, transparent) 0%, transparent 70%)",
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
