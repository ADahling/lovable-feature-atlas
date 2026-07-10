import { useEffect, useRef, useState } from "react";

/**
 * Atlas custom cursor system.
 *
 * Two elements track the pointer on desktop devices:
 *  - 8px gold dot (tracks pointer 1:1)
 *  - Trailing ring (lerp 0.15) whose size, label and glyph change based on
 *    the interactive target under the cursor:
 *      • [data-cursor="view"]     → VIEW badge, 56px ring    (feature cards)
 *      • [data-cursor="external"] or an anchor to a different
 *        origin                   → arrow glyph, 44px ring    (docs, share)
 *      • button / role=button /
 *        toggle / [data-cursor="button"]  → 40px plain ring   (controls)
 *      • [data-cursor="magnetic"] → 36px plain ring + the target itself
 *        subtly translates toward the cursor (max 12px) — hero quiz CTA,
 *        "Start building on Lovable" CTA
 *      • otherwise idle 32px ring
 *
 * Hidden on touch devices and for prefers-reduced-motion.
 */

type CursorMode = "idle" | "view" | "external" | "button" | "magnetic";

const MODE_SIZE: Record<CursorMode, number> = {
  idle: 32,
  view: 56,
  external: 44,
  button: 40,
  magnetic: 36,
};

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<CursorMode>("idle");
  // Start hidden so the dot never renders pinned at viewport origin (0,0)
  // before the first pointermove. Revealed on the first `mousemove`.
  const [hidden, setHidden] = useState(true);

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
    let magneticEl: HTMLElement | null = null;

    const clearMagnetic = () => {
      if (magneticEl) {
        magneticEl.style.transform = "";
        magneticEl.style.transition =
          "transform 220ms cubic-bezier(0.22,1,0.36,1)";
        magneticEl = null;
      }
    };

    const detectMode = (target: HTMLElement | null): {
      mode: CursorMode;
      magnetic: HTMLElement | null;
    } => {
      if (!target) return { mode: "idle", magnetic: null };
      const magneticTarget = target.closest<HTMLElement>('[data-cursor="magnetic"]');
      if (magneticTarget) return { mode: "magnetic", magnetic: magneticTarget };
      if (target.closest('[data-cursor="view"]')) return { mode: "view", magnetic: null };
      if (target.closest('[data-cursor="external"]')) return { mode: "external", magnetic: null };
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (link) {
        const href = link.getAttribute("href") ?? "";
        const isExternal =
          /^https?:\/\//i.test(href) &&
          !href.startsWith(window.location.origin);
        return { mode: isExternal ? "external" : "view", magnetic: null };
      }
      if (
        target.closest(
          'button, [role="button"], [role="switch"], [data-cursor="button"], input[type="button"], input[type="submit"]',
        )
      ) {
        return { mode: "button", magnetic: null };
      }
      return { mode: "idle", magnetic: null };
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
      }
      const target = e.target as HTMLElement | null;
      // Hide entirely over the fixed nav / any chrome opted-out — the
      // ring pill collides with tight nav text and reads as garbled
      // characters ("V DE W" over DRAW).
      const overChrome = !!target?.closest('nav, [data-cursor="hide"], [role="navigation"]');
      setHidden(overChrome);
      const detected = detectMode(target);
      setMode(detected.mode);

      // Magnetic snap — translate the button toward the cursor, clamped.
      if (detected.magnetic) {
        if (magneticEl && magneticEl !== detected.magnetic) clearMagnetic();
        magneticEl = detected.magnetic;
        const rect = magneticEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(-12, Math.min(12, (mx - cx) * 0.25));
        const dy = Math.max(-12, Math.min(12, (my - cy) * 0.25));
        magneticEl.style.transition =
          "transform 120ms cubic-bezier(0.22,1,0.36,1)";
        magneticEl.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      } else if (magneticEl) {
        clearMagnetic();
      }
    };

    const onLeave = () => {
      setMode("idle");
      setHidden(true);
      clearMagnetic();
    };

    // Scrolling can strand the trailing ring in an orphaned position (the
    // pointer hasn't moved, so the ring stays where it was on the page).
    // Hide during scroll and reveal on the next pointer move.
    let scrollHideTimer = 0;
    const onScroll = () => {
      setHidden(true);
      window.clearTimeout(scrollHideTimer);
      scrollHideTimer = window.setTimeout(() => {
        // Stay hidden until the next mousemove restores position.
      }, 120);
    };

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
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(scrollHideTimer);
      cancelAnimationFrame(raf);
      clearMagnetic();
    };
  }, []);

  if (!mounted || !active) return null;

  const size = MODE_SIZE[mode];
  const filled = mode !== "idle";
  const showLabel = mode === "view";
  const showArrow = mode === "external";

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex items-center justify-center rounded-full border border-gold/80"
        style={{
          width: size,
          height: size,
          transition:
            "width 220ms cubic-bezier(0.16,1,0.3,1), height 220ms cubic-bezier(0.16,1,0.3,1), background-color 220ms, border-color 220ms, opacity 140ms",
          backgroundColor: filled
            ? "color-mix(in oklab, #C9A961 10%, transparent)"
            : "transparent",
          mixBlendMode: "difference",
          opacity: hidden ? 0 : 1,
          visibility: hidden ? "hidden" : "visible",
        }}
      >
        <span
          className="font-mono uppercase tracking-[0.2em] text-cream select-none"
          style={{
            fontSize: 9,
            opacity: showLabel ? 1 : 0,
            transition: "opacity 180ms",
          }}
        >
          view
        </span>
        {showArrow && (
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="absolute text-cream"
            aria-hidden
          >
            <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {/* Gold dot */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] size-2 rounded-full"
        style={{ background: "var(--gold)", opacity: hidden ? 0 : 1, transition: "opacity 140ms" }}
      />
    </>
  );
}
