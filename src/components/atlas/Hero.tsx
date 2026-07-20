import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { Link } from "@tanstack/react-router";
import { ExternalLink, X } from "lucide-react";

const HINT_KEY = "atlas.hero-hint-dismissed";
const HINT_SESSION_KEY = "atlas.hero-hint-shown-session";
const HERO_ENTERED_KEY = "atlas.hero-entered-session";
import { useMediaQuery } from "../../hooks/use-media-query";
import { trackEvent } from "../../lib/analytics";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "../ui/sheet";
import { accentForCategory } from "../../lib/category-theme";
import { fmtMonthYearUTC } from "../../lib/format-date";
import type { FeatureCard } from "../../lib/features.functions";

const LazyHeroConstellation = lazy(() =>
  import("./HeroConstellation").then(({ HeroConstellation }) => ({
    default: HeroConstellation,
  })),
);

// ---------- Count-up stat ----------
// SSR renders the final value so the number is real in the first HTML
// response (and for crawlers / no-JS visits). After hydration the counter
// replays from zero once, like a film-title statistic landing.
function CountUp({ value, reduced }: { value: number; reduced: boolean }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (reduced || value <= 0) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [value, reduced]);
  return <span className="tabular-nums">{display}</span>;
}

// ---------- Hero ----------

export interface HeroStats {
  total: number;
  categories: number;
  ga: number;
}

/**
 * The title sequence. Parchment letterbox bars part outward like theater
 * curtains over the first 400px of scroll, the gilded key art drifts
 * (Ken Burns 1.06 → 1.0), and the film title card sits centered with live
 * count-up stats. The interactive star layer is the existing deferred
 * constellation — its keyboard group semantics and preview sheet are a
 * protected accessibility contract and are preserved unchanged.
 */
export function Hero({ stats }: { stats: HeroStats }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTouch = useMediaQuery("(pointer: coarse)");
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const [hintDismissed, setHintDismissed] = useState(true);
  const [heroEntered, setHeroEntered] = useState(false);
  const [constellationReady, setConstellationReady] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureCard | null>(null);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!isDesktop || constellationReady) return;

    const revealConstellation = () => setConstellationReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const idleHandle = window.requestIdleCallback(revealConstellation, { timeout: 1_500 });
      return () => window.cancelIdleCallback(idleHandle);
    }

    const timeoutHandle = window.setTimeout(revealConstellation, 250);
    return () => window.clearTimeout(timeoutHandle);
  }, [constellationReady, isDesktop]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const permanentlyDismissed = window.localStorage.getItem(HINT_KEY) === "1";
      const shownThisSession = window.sessionStorage.getItem(HINT_SESSION_KEY) === "1";
      const dismissed = permanentlyDismissed || shownThisSession;
      setHintDismissed(dismissed);
      if (!dismissed) {
        window.sessionStorage.setItem(HINT_SESSION_KEY, "1");
      }
      const entered = window.sessionStorage.getItem(HERO_ENTERED_KEY) === "1";
      setHeroEntered(entered);
      if (!entered) {
        window.sessionStorage.setItem(HERO_ENTERED_KEY, "1");
      }
    } catch {
      setHintDismissed(false);
    }
  }, []);
  const dismissHint = () => {
    setHintDismissed(true);
    try {
      window.localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Scroll choreography — the only scroll-driven motion on the site.
  // Letterbox bars part over the first 400px; the key art settles from
  // 1.06 to 1.0. Transform/opacity only; collapses under reduced motion.
  const { scrollY } = useScroll();
  const topBarY = useTransform(scrollY, [0, 400], reduced ? ["0%", "0%"] : ["0%", "-104%"]);
  const bottomBarY = useTransform(scrollY, [0, 400], reduced ? ["0%", "0%"] : ["0%", "104%"]);
  // Always the same range on server and first client render — reduced-motion
  // users get the resting frame via the `.hero-kenburns` CSS override, which
  // avoids an SSR/client style mismatch (useReducedMotion is null on the server).
  const kenBurnsScale = useTransform(scrollY, [0, 600], [1.06, 1]);
  const cueOpacity = useTransform(scrollY, [0, 240], [1, 0]);

  return (
    <section
      ref={sectionRef}
      data-atlas-hero-canvas
      className="relative isolate w-full overflow-hidden bg-ink text-cream"
    >
      {/* Key art — gilded constellation map glowing through golden clouds.
          Preloaded from the route head; the LCP element is the title, so the
          art is decorative (empty alt) and width-capped by srcSet. */}
      <motion.div
        aria-hidden
        className="hero-kenburns absolute inset-0 z-0"
        style={{ scale: kenBurnsScale }}
      >
        <img
          src="/art/hero-key-art.jpg"
          srcSet="/art/hero-key-art-960.webp 960w, /art/hero-key-art-1600.webp 1600w, /art/hero-key-art-2400.webp 2400w"
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        {/* Ivory scrim — bottom 30% plus a soft center veil keep the title
            and mono lines legible over the art. */}
        <div
          className="absolute inset-x-0 bottom-0 h-[30%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(251,248,241,0) 0%, rgba(251,248,241,0.82) 70%, rgba(251,248,241,0.95) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 62% 52% at 50% 46%, rgba(251,248,241,0.78) 0%, rgba(251,248,241,0.42) 48%, rgba(251,248,241,0) 76%)",
          }}
        />
      </motion.div>

      {/* Interactive star layer — the deferred constellation chart. One
          keyboard tab stop, arrow-key roving focus, Enter opens the preview
          sheet below. Protected contract; do not restructure. */}
      {isDesktop && constellationReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 z-[1] hidden lg:block"
        >
          <Suspense fallback={null}>
            <LazyHeroConstellation
              onFirstInteraction={dismissHint}
              skipEntrance={heroEntered}
              onSelect={setSelectedFeature}
            />
          </Suspense>
        </motion.div>
      )}

      {/* Letterbox bars — parchment theater curtains. */}
      <motion.div aria-hidden className="letterbox-bar" data-edge="top" style={{ y: topBarY }} />
      <motion.div
        aria-hidden
        className="letterbox-bar"
        data-edge="bottom"
        style={{ y: bottomBarY }}
      />

      {/* Title card */}
      <div className="container-atlas relative z-10 flex min-h-[92svh] flex-col items-center justify-center py-[16vh] text-center lg:min-h-[100svh]">
        <div className="rise-stagger flex flex-col items-center gap-6">
          <p className="t-eyebrow m-0 text-cream/75">A Dahling Digital Production</p>

          <h1
            className="t-display m-0 max-w-5xl [text-wrap:balance]"
            style={{
              backgroundImage: "var(--gradient-display)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 1px 14px rgba(251,248,241,0.75))",
            }}
          >
            The Lovable Feature Atlas: Complete Release Catalog
          </h1>

          <p className="t-eyebrow m-0 text-cream/75">
            An independent catalog of everything Lovable ships
          </p>

          {/* Count-up stats — live totals from the Cloud catalog, never
              hardcoded. SSR carries the real numbers. */}
          <div
            aria-label="Atlas totals"
            className="mt-2 flex flex-wrap items-baseline justify-center gap-x-6 gap-y-2 border-y border-line px-6 py-3"
          >
            {[
              { value: stats.total, label: "features" },
              { value: stats.categories, label: "categories" },
              { value: stats.ga, label: "generally available" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-baseline gap-2">
                {i > 0 && (
                  <span aria-hidden className="mr-4 hidden text-gold-metal sm:inline">
                    ·
                  </span>
                )}
                <span className="font-mono text-[15px] font-semibold tabular-nums tracking-[0.08em] text-cream sm:text-[17px]">
                  <CountUp value={s.value} reduced={reduced} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/65 sm:text-[11px]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA pair — the catalog outranks the quiz. */}
          <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#catalog"
              onClick={() =>
                trackEvent("hero_cta_clicked", {
                  cta: "enter_catalog",
                  location: "homepage_hero",
                })
              }
              className="btn-foil inline-flex items-center gap-2.5 rounded-md px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Enter the catalog
              <span aria-hidden>→</span>
            </a>
            <Link
              to="/quiz"
              onClick={() =>
                trackEvent("hero_cta_clicked", {
                  cta: "take_quiz",
                  location: "homepage_hero",
                })
              }
              className="ticket-cta group relative inline-flex flex-col items-start gap-0.5 py-2 pl-5 pr-16 text-left transition-colors hover:border-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold">
                Admit one · 90 seconds
              </span>
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-cream/90 transition-colors group-hover:text-gold">
                Take the screening
              </span>
              <span
                aria-hidden
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-gold transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            <Link
              to="/draw"
              className="group inline-flex items-center gap-1 rounded-full border border-line bg-ink/85 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-cream backdrop-blur-[2px] transition-colors hover:border-line-strong hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              Draw a card
              <span aria-hidden className="opacity-60 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <span aria-hidden className="text-cream/30">
              ·
            </span>
            <Link
              to="/constellation"
              className="group inline-flex items-center gap-1 rounded-full border border-line bg-ink/85 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-cream backdrop-blur-[2px] transition-colors hover:border-line-strong hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              Open the full constellation
              <span aria-hidden className="opacity-60 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>

          <p className="m-0 font-mono text-[10px] uppercase tracking-[0.18em] text-cream/60">
            Curated by{" "}
            <a
              href="https://dahlingdigital.com"
              target="_blank"
              rel="noopener"
              className="text-cream/80 underline-offset-4 hover:text-emerald hover:underline"
            >
              Alicia Dahling
            </a>{" "}
            · Not affiliated with Lovable AB
          </p>

          {/* Constellation interaction hint — desktop pointer users only,
              until first interaction (persisted). */}
          {isDesktop && !isTouch && !hintDismissed && mounted && constellationReady && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="m-0 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/60"
            >
              The stars are the catalog
              <span className="mx-2 text-cream/30" aria-hidden>
                ·
              </span>
              Hover to identify
              <span className="mx-2 text-cream/30" aria-hidden>
                ·
              </span>
              Click to open
            </motion.p>
          )}
        </div>
      </div>

      {/* Scroll cue — sits just above the bottom letterbox bar. */}
      <motion.div
        aria-hidden
        style={{ opacity: cueOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-[calc(6vh+14px)] z-10 flex justify-center sm:bottom-[calc(12vh+14px)]"
      >
        <p className="scroll-cue m-0 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/70">
          The catalog begins below ↓
        </p>
      </motion.div>

      {/* Hero star preview drawer — opened when any constellation star is
          clicked or activated via keyboard. Exactly one close control. */}
      <HeroStarPreview
        feature={selectedFeature}
        onOpenChange={(o) => !o && setSelectedFeature(null)}
      />
    </section>
  );
}

function HeroStarPreview({
  feature,
  onOpenChange,
}: {
  feature: FeatureCard | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = feature !== null;
  const accent = feature ? accentForCategory(feature.category, "light") : "#C9A227";
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        hideCloseButton
        className="w-full sm:max-w-md border-l border-line bg-ink text-cream p-0 flex flex-col gap-0"
      >
        {feature && (
          <div className="flex h-full flex-col overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: accent }}
              >
                {feature.category}
              </span>
              <button
                type="button"
                aria-label="Close preview"
                onClick={() => onOpenChange(false)}
                className="grid size-8 place-items-center rounded-full border border-line text-cream/70 transition-colors hover:border-gold-deep hover:text-gold"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <SheetTitle asChild>
              <h2 className="mt-4 font-display text-2xl font-semibold text-cream">
                {feature.name}
              </h2>
            </SheetTitle>

            <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cream/65">
              <span
                className="rounded border px-2 py-0.5"
                style={{
                  borderColor: accent,
                  color: accent,
                }}
              >
                {feature.status}
              </span>
              <span aria-hidden className="text-cream/30">
                ·
              </span>
              <span>Premiered {fmtMonthYearUTC(feature.releaseDate)}</span>
              <span aria-hidden className="text-cream/30">
                ·
              </span>
              <span className="text-cream/65">{feature.pricing}</span>
            </div>

            {feature.tagline && (
              <SheetDescription asChild>
                <p className="mt-5 text-[15px] leading-relaxed text-cream/80">{feature.tagline}</p>
              </SheetDescription>
            )}

            <div className="mt-auto flex flex-col gap-2 pt-8">
              <Link
                to="/features/$slug"
                params={{ slug: feature.id }}
                onClick={() => onOpenChange(false)}
                className="btn-foil inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              >
                Open full record
                <ExternalLink className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
