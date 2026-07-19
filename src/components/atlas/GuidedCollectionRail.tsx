import { ArrowRight, Compass } from "lucide-react";
import { PRESETS, type PresetDef } from "../../lib/atlas-presets";

interface Props {
  onPreset: (preset: PresetDef) => void;
}

/** A persistent, SSR-visible collection rail with no local-storage flash. */
export function GuidedCollectionRail({ onPreset }: Props) {
  return (
    <section className="container-atlas pt-8 lg:pt-10" aria-labelledby="guided-entry-title">
      <div className="overflow-hidden rounded-xl border border-gold/20 bg-muted-ink shadow-[var(--shadow-paper)]">
        <div className="flex flex-col gap-3 border-b border-gold/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/[0.08] text-gold">
              <Compass className="size-4" aria-hidden />
            </span>
            <div>
              <p id="guided-entry-title" className="font-display text-xl font-medium text-cream">
                Pick a trail through the atlas.
              </p>
              <p className="mt-1 text-sm leading-relaxed text-cream/60">
                Start with the outcome you want. We will set the useful filters for you.
              </p>
            </div>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-cream/45 sm:block">
            Five guided collections
          </span>
        </div>

        <div className="grid divide-y divide-gold/10 md:grid-cols-5 md:divide-x md:divide-y-0">
          {PRESETS.map((preset, index) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPreset(preset)}
              className="group flex min-h-28 flex-col items-start px-5 py-4 text-left outline-none transition-colors hover:bg-gold/[0.05] focus-visible:bg-gold/[0.06] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/60"
            >
              <span className="font-mono text-[10px] tabular-nums tracking-[0.16em] text-gold">
                0{index + 1}
              </span>
              <span className="mt-3 text-[14px] font-semibold leading-snug text-cream">
                {preset.label}
              </span>
              <span className="mt-1 text-[12px] leading-relaxed text-cream/75">
                {preset.hint}
              </span>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald transition-colors group-hover:text-gold">
                {preset.navTo ? "Take quiz" : "Open collection"}
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

