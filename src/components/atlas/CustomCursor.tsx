import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.4 });

  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(pointer: fine)");
    const update = () => setHasFinePointer(mql.matches);
    update();
    mql.addEventListener("change", update);
    if (!mql.matches) return () => mql.removeEventListener("change", update);
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX - 16);
      y.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      mql.removeEventListener("change", update);
    };
  }, [x, y]);

  if (!mounted || !hasFinePointer) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 rounded-full border border-cream mix-blend-difference"
      style={{ x: sx, y: sy }}
    />
  );
}
