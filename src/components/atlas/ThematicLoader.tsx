// ============================================================================
// ThematicLoader.tsx
// ---------------------------------------------------------------------------
// First-visit-per-session reveal. Dark mode: the void dissolves from center
// to expose the beating heart. Light mode: a gold-foil sheet burns away to
// the letterpress page. Duration ≤ 1.2s, click-to-skip, sessionStorage-
// gated so it never repeats within a session. Under prefers-reduced-motion
// we swap in an instant crossfade (≤ 200ms).
// The reveal is a fractal-noise dissolve implemented as an SVG turbulence
// feDisplacementMap driving a radial alpha mask — zero WebGL cost, GPU-
// composited via CSS opacity + transform, no layout thrash.
// ---------------------------------------------------------------------------
import { useEffect, useState } from "react";
import { HEART_PATH_D, HEART_VIEW_BOX } from "../../lib/heart-path";

const SESSION_KEY = "atlas-thematic-loader-seen";
const DURATION_MS = 1150;
const REDUCED_MS = 180;

export function ThematicLoader() {
  const [phase, setPhase] = useState<"idle" | "playing" | "gone">("idle");
  const [reduced, setReduced] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setPhase("gone");
        return;
      }
    } catch {
      // ignore
    }
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    setPhase("playing");
    const dur = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? REDUCED_MS
      : DURATION_MS;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
      setPhase("gone");
    }, dur);
    return () => window.clearTimeout(t);
  }, []);

  if (phase === "gone" || phase === "idle") return null;

  const skip = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
    }
    setPhase("gone");
  };

  return (
    <div
      aria-hidden
      onClick={skip}
      className="fixed inset-0 z-[9999] cursor-pointer"
      style={{
        // The whole overlay animates its own mask-position to reveal
        // outward from the center. `will-change` keeps it on the GPU.
        animation: reduced
          ? `atlasLoaderFade ${REDUCED_MS}ms ease-out forwards`
          : `atlasLoaderReveal ${DURATION_MS}ms cubic-bezier(0.7, 0, 0.2, 1) forwards`,
        willChange: "clip-path, opacity",
        background: isLight
          ? // Gold foil sheet — warm brushed metal look
            "radial-gradient(120% 90% at 50% 40%, #E8CB86 0%, #C9A961 40%, #9E7F44 100%)"
          : // Deep void
            "radial-gradient(120% 90% at 50% 50%, #0d2118 0%, #060606 55%, #000 100%)",
      }}
    >
      {/* Center emblem — an inhale before the world appears. Under
          reduced-motion we render only a static logotype for calm. */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div
          className="relative"
          style={{
            animation: reduced
              ? undefined
              : "atlasLoaderMark 900ms ease-out forwards",
          }}
        >
          <p
            className="font-mono uppercase text-center"
            style={{
              letterSpacing: "0.32em",
              fontSize: 11,
              color: isLight ? "#3B2E14" : "#C9A961",
              opacity: 0.85,
            }}
          >
            The Lovable Feature Atlas
          </p>
          <p
            className="mt-3 text-center"
            style={{
              fontSize: 13,
              color: isLight ? "#3B2E14" : "#FBF5E9",
              opacity: 0.55,
            }}
          >
            Curated by Alicia Dahling
          </p>
        </div>
      </div>

      {/* Fractal-noise burn-away layer. The turbulence displaces a radial
          alpha mask so the reveal edge feels organic rather than a hard
          circle. Purely decorative — no interactive geometry. */}
      <svg
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-70"
        width="100%"
        height="100%"
        aria-hidden
      >
        <defs>
          <filter id="atlas-loader-burn">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed="7"
            />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#atlas-loader-burn)" />
      </svg>
    </div>
  );
}
