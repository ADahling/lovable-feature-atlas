import { useEffect, useState } from "react";
import { ArrowRight, Compass, X } from "lucide-react";
import { PRESETS, type PresetDef } from "../../lib/atlas-presets";

const STORAGE_KEY = "atlas.onboarding.seen.v1";

interface Props {
  onPreset: (p: PresetDef) => void;
}

/**
 * Compact between-hero-and-catalog module offering five guided entry paths.
 * First visit: rendered open. Subsequent visits (localStorage flag): collapses
 * to a quiet "Not sure where to start?" text link that expands the module.
 * Never blocks the catalog — dismissible any time.
 */
export function OnboardingModule({ onPreset }: Props) {
  // Default to null so SSR renders nothing and the client fills in after
  // reading localStorage. Prevents a first-paint flash of the wrong state.
  const [seen, setSeen] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let s = false;
    try {
      s = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* storage blocked — treat as first visit */
    }
    setSeen(s);
    setExpanded(!s);
  }, []);

  function markSeen() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setSeen(true);
  }

  function handleClick(p: PresetDef) {
    markSeen();
    onPreset(p);
  }

  function dismiss() {
    markSeen();
    setExpanded(false);
  }

  if (seen === null) {
    // SSR / pre-hydration: leave a fixed-height placeholder so the layout
    // doesn't jump when the client fills state in.
    return <div aria-hidden className="container-atlas h-0 lg:h-0" />;
  }

  if (!expanded) {
    return (
      <section className="container-atlas pt-8 lg:pt-10" aria-label="Guided entry">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/55 transition-colors hover:text-gold"
        >
          <Compass className="size-3.5" aria-hidden />
          Not sure where to start?
          <ArrowRight className="size-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
      </section>
    );
  }

  return (
    <section
      className="container-atlas pt-10 lg:pt-14"
      aria-labelledby="onboarding-heading"
    >
      <div className="relative overflow-hidden rounded-xl border border-cream/10 bg-cream/[0.03] backdrop-blur-md">
        <div className="flex items-start justify-between gap-4 border-b border-cream/[0.06] px-4 py-3 sm:px-6">
          <div>
            <p className="t-eyebrow text-emerald">Guided entry</p>
            <h2
              id="onboarding-heading"
              className="mt-1 font-sans text-[15px] font-medium text-cream sm:text-base"
            >
              What are you trying to learn?
            </h2>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss guided entry"
            className="shrink-0 rounded-md border border-transparent p-1.5 text-cream/50 transition-colors hover:border-cream/15 hover:text-cream"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <ul className="grid grid-cols-1 gap-px bg-cream/[0.04] sm:grid-cols-2 lg:grid-cols-5">
          {PRESETS.map((p) => (
            <li key={p.id} className="bg-ink/60">
              <button
                type="button"
                onClick={() => handleClick(p)}
                className="group flex h-full w-full flex-col items-start gap-2 px-4 py-4 text-left transition-colors hover:bg-emerald/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-inset sm:px-5 sm:py-5"
              >
                <span className="font-sans text-[13px] font-medium leading-snug text-cream group-hover:text-cream sm:text-[13.5px]">
                  {p.label}
                </span>
                <span className="font-mono text-[10.5px] leading-relaxed text-cream/55 group-hover:text-cream/70">
                  {p.hint}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald/70 group-hover:text-gold">
                  {p.navTo ? "Take quiz" : "Apply"}
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
