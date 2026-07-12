import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface QuizProgressPillProps {
  count: number;
  total: number;
  pct: number;
  tier: string;
  onGetCard: () => void;
  onReset: () => void;
  disabled: boolean;
}

/**
 * Floating pill anchored to the bottom-center of the viewport, always visible
 * while scrolling. Tier name morphs (fade + slight y) on change via
 * AnimatePresence keyed on the tier string.
 */
export function QuizProgressPill({
  count,
  total,
  pct,
  tier,
  onGetCard,
  onReset,
  disabled,
}: QuizProgressPillProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pr-16 sm:bottom-6 sm:px-4 sm:pr-4"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-live="polite"
    >
      <div className="pointer-events-auto flex w-full max-w-2xl flex-col gap-2 border-t border-cream/12 bg-ink/90 p-3 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-4 sm:rounded-full sm:border sm:py-2.5 sm:pl-5 sm:pr-2.5 sm:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.75)]">
        {/* count + tier */}
        <div className="flex min-w-0 items-baseline gap-3 sm:flex-1">
          <span className="font-mono text-xl leading-none text-cream sm:text-2xl">
            {count}
            <span className="text-cream/40"> / </span>
            {total}
          </span>
          <span className="font-mono text-xs text-cream/50">{pct}%</span>
          <span className="ml-auto hidden sm:inline-block" />
          <span className="relative h-4 min-w-[8ch] overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={tier}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-gold"
              >
                {tier}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        {/* progress track (mobile row) */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-cream/10 sm:hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald to-gold transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          {count > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/55 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
              aria-label="Reset progress"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onGetCard}
            disabled={disabled}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-gold/60 bg-gold/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            Get my card
          </button>
        </div>
      </div>
    </div>
  );
}
