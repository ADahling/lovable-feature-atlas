import { useEffect, useRef, useState } from "react";

/**
 * Two-part cursor for desktop pointer devices:
 *  - 8px gold dot (tracks the pointer 1:1)
 *  - 32px trailing ring (lerp 0.15, expands to 56px + shows a "view" label
 *    when hovering feature cards, links, or elements with data-cursor="view")
 *
 * Hidden on touch devices and for prefers-reduced-motion. Never blocks clicks.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const pointerFine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shouldRun = () => pointerFine.matches && !reduced.matches;

    if (!shouldRun()) {
      setActive(false);
      return;
    }
    setActive(true);

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
      }
      // Detect interactive target — restrict to explicit feature cards
      // and anchor links so the VIEW badge never latches onto unrelated
      // controls like the theme toggle or filter pills.
      const target = e.target as HTMLElement | null;
      const interactive =
        !!target && !!target.closest('[data-cursor="view"], a[href]');
      setHovering(interactive);
    };

    const onLeave = () => setHovering(false);

    const tick = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!mounted || !active) return null;

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex items-center justify-center rounded-full border border-gold/80"
        style={{
          width: hovering ? 56 : 32,
          height: hovering ? 56 : 32,
          transition:
            "width 220ms cubic-bezier(0.16,1,0.3,1), height 220ms cubic-bezier(0.16,1,0.3,1), background-color 220ms, border-color 220ms",
          backgroundColor: hovering ? "color-mix(in oklab, #C9A961 12%, transparent)" : "transparent",
          mixBlendMode: "difference",
        }}
      >
        <span
          className="font-mono uppercase tracking-[0.2em] text-cream select-none"
          style={{
            fontSize: 9,
            opacity: hovering ? 1 : 0,
            transition: "opacity 180ms",
          }}
        >
          view
        </span>
      </div>
      {/* Gold dot */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] size-2 rounded-full"
        style={{ background: "var(--gold)" }}
      />
    </>
  );
}
