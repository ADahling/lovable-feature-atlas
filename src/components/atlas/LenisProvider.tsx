// ============================================================================
// LenisProvider.tsx
// ---------------------------------------------------------------------------
// Lenis-class smooth scroll sitewide. Physics lerp ~0.08, synced to the
// browser's own RAF (single loop). We also publish a live scroll-velocity
// value onto the document as a CSS custom property `--scroll-vel` (px/s,
// signed) so any element in the tree can react with pure CSS. Consumers use
// this today for a very subtle display-type skew (see `.scroll-skew`).
// prefers-reduced-motion → smooth scroll is disabled and velocity is pinned
// to 0. Cleaned up on unmount to avoid double-RAF loops in dev.
// ---------------------------------------------------------------------------
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

const MAX_SKEW_DEG = 1.5; // display-type max skew in degrees
const VELOCITY_CAP_PX_S = 3400; // above this, skew clamps
const SPRINGBACK_MS = 220; // css transition on the CSS var consumers

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // We still mount Lenis under reduced-motion for programmatic scrollTo
    // support, but we set lerp=1 (instant) so the scroll feels native.
    const lenis = new Lenis({
      // Lerp is Lenis's physics smoothing: 0..1, closer to 0 = softer.
      // ~0.08 is the "editorial glide" studios reach for.
      lerp: prefersReduced ? 1 : 0.08,
      smoothWheel: !prefersReduced,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    // Publish the velocity + skew as CSS variables on <html>.
    const root = document.documentElement;
    root.style.setProperty("--scroll-vel", "0");
    root.style.setProperty("--scroll-skew", "0deg");
    root.style.setProperty("--scroll-skew-transition", `${SPRINGBACK_MS}ms`);

    let lastVelWrite = 0;
    let lastSkewClass = false;
    const onScroll = (e: { velocity: number }) => {
      if (prefersReduced) return;
      const now = performance.now();
      // Throttle to ~60 writes/s.
      if (now - lastVelWrite < 14) return;
      lastVelWrite = now;
      const v = e.velocity; // px/frame in current Lenis; we surface as-is
      const clamped = Math.max(-VELOCITY_CAP_PX_S, Math.min(VELOCITY_CAP_PX_S, v * 60));
      const skew = (clamped / VELOCITY_CAP_PX_S) * MAX_SKEW_DEG;
      root.style.setProperty("--scroll-vel", clamped.toFixed(2));
      root.style.setProperty("--scroll-skew", `${skew.toFixed(3)}deg`);
      const isMoving = Math.abs(v) > 0.02;
      if (isMoving !== lastSkewClass) {
        lastSkewClass = isMoving;
        root.classList.toggle("is-scroll-moving", isMoving);
      }
    };
    lenis.on("scroll", onScroll);

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Spring the skew back to 0 when the wheel stops.
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const restIntervalId = window.setInterval(() => {
      if (prefersReduced) return;
      // If no scroll event fires in 90ms, treat as idle → zero the vars.
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        root.style.setProperty("--scroll-vel", "0");
        root.style.setProperty("--scroll-skew", "0deg");
        root.classList.remove("is-scroll-moving");
      }, 90);
    }, 120);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(restIntervalId);
      if (idleTimer) clearTimeout(idleTimer);
      lenis.destroy();
      root.classList.remove("is-scroll-moving");
    };
  }, []);
  return <>{children}</>;
}
