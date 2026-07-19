import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { FeatureCard as Feature } from "../../lib/features.functions";
import { categoryAccentVar } from "../../lib/category-theme";
import {
  comingSoon,
  STALE_AFTER_DAYS,
  type ComingAttraction,
  type ComingStatus,
} from "../../data/coming-soon";

const STATUS_CLASS: Record<ComingStatus, string> = {
  Beta: "border-gold-deep bg-gold-metal/15 text-gold",
  Preview: "border-line-strong bg-transparent text-cream/85",
  "Rolling out": "border-emerald/40 bg-emerald/[0.06] text-emerald",
  Announced: "border-line bg-transparent text-cream/75",
  Rumored: "border-dashed border-line-strong bg-transparent text-cream/75",
};

/**
 * An entry has shipped once the (nightly-refreshed) catalog contains a
 * matching released feature. Matching is limited to releases newer than a
 * month before the entry was sourced, so an old feature with a similar
 * name can never hide a genuinely upcoming one.
 */
function hasShipped(entry: ComingAttraction, released: Feature[]): boolean {
  const floor = new Date(entry.sourcedAt);
  floor.setUTCDate(floor.getUTCDate() - 30);
  return released.some((f) => {
    if (!f.releaseDate) return false;
    if (new Date(f.releaseDate) < floor) return false;
    if (entry.matchIds.includes(f.id)) return true;
    if (entry.matchName && f.name.toLowerCase().includes(entry.matchName)) return true;
    return false;
  });
}

/**
 * Coming Attractions — previews of what the official record says is next:
 * betas, research previews, gradual rollouts, announcements, and (clearly
 * labeled) sourced rumors. The section runs itself: entries retire the
 * moment the nightly catalog refresh picks up the released feature, and
 * unverified entries age out after {@link STALE_AFTER_DAYS} days.
 */
export function ComingAttractions({ features }: { features: Feature[] }) {
  // Staleness is applied after hydration so server and client HTML always
  // agree; ship-matching is deterministic on the passed catalog.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
  }, []);

  const visible = useMemo(() => {
    let list = comingSoon.filter((entry) => !hasShipped(entry, features));
    if (now !== null) {
      const staleMs = STALE_AFTER_DAYS * 86_400_000;
      list = list.filter((entry) => now - new Date(entry.sourcedAt).getTime() < staleMs);
    }
    return list;
  }, [features, now]);

  if (visible.length === 0) return null;

  return (
    <section aria-labelledby="coming-attractions-title" className="border-b border-line">
      <div className="container-atlas section-y">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="t-eyebrow text-gold">Coming Attractions</p>
            <h2 id="coming-attractions-title" className="t-title mt-3 text-cream">
              Previews of what&rsquo;s next.
            </h2>
          </div>
          <p className="m-0 max-w-sm text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-cream/60">
            Betas, previews &amp; rollouts from the official record · entries retire themselves
            when a release ships
          </p>
        </div>

        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((entry) => {
            const accent = categoryAccentVar(entry.category);
            return (
              <li key={entry.id} className="m-0 min-w-0 p-0">
                <article className="card-cine flex h-full flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]"
                      style={{ color: accent }}
                    >
                      <span
                        aria-hidden
                        className="inline-block size-1.5 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                      {entry.category}
                    </span>
                    <span
                      className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${STATUS_CLASS[entry.status]}`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <h3 className="m-0 font-display text-xl font-medium leading-tight tracking-[-0.01em] text-cream">
                    {entry.name}
                  </h3>
                  <p className="m-0 text-[14px] leading-relaxed text-cream/75">{entry.tagline}</p>

                  <a
                    href={entry.source}
                    target="_blank"
                    rel="noopener"
                    className="mt-auto inline-flex items-center gap-1.5 pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/65 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                  >
                    {entry.sourceLabel} · verified {entry.sourcedAt}
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                </article>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-cream/60">
          Nothing here second-guesses the official record — premieres land in the catalog the
          night they ship.
        </p>
      </div>
    </section>
  );
}
