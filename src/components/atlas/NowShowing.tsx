import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { FeatureCard as Feature } from "../../lib/features.functions";
import { categoryAccentVar } from "../../lib/category-theme";
import { fmtMonthDayYearUTC } from "../../lib/format-date";

const RATING_LABEL: Record<Feature["status"], string> = {
  GA: "Rated GA",
  Beta: "Rated Beta",
  Removed: "Retired",
};

const RATING_CLASS: Record<Feature["status"], string> = {
  GA: "border-gold-deep bg-gold-metal/15 text-gold",
  Beta: "border-line-strong bg-transparent text-cream/80",
  Removed: "border-line bg-transparent text-cream/60",
};

/**
 * Now Showing — the six newest releases as 2:3 movie posters on parchment.
 * Category reads as genre, the release date as the premiere, and the status
 * as the rating card. Poster art is the shared gilded-constellation field
 * with a per-category tint.
 */
export function NowShowing({ features }: { features: Feature[] }) {
  const premieres = useMemo(
    () =>
      [...features]
        .filter((f) => Boolean(f.releaseDate))
        .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
        .slice(0, 6),
    [features],
  );

  if (premieres.length === 0) return null;

  return (
    <section
      aria-labelledby="now-showing-title"
      className="border-y border-line bg-parchment"
    >
      <div className="container-atlas section-y">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="t-eyebrow text-gold">Now Showing</p>
            <h2 id="now-showing-title" className="t-title mt-3 text-cream">
              This week&rsquo;s premieres.
            </h2>
          </div>
          <p className="m-0 font-mono text-[11px] uppercase tracking-[0.18em] text-cream/60">
            The {premieres.length} newest releases · updated nightly
          </p>
        </div>

        <ul className="grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-3 xl:grid-cols-6 xl:gap-5">
          {premieres.map((feature) => (
            <li key={feature.id} className="m-0 min-w-0 p-0">
              <PremierePoster feature={feature} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PremierePoster({ feature }: { feature: Feature }) {
  const accent = categoryAccentVar(feature.category);
  return (
    <Link
      to="/features/$slug"
      params={{ slug: feature.id }}
      // No aria-label: the link's accessible name is its visible text —
      // category, title, premiere date, and rating — already descriptive.
      className="poster-card group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
    >
      {/* Shared poster field — gilded constellation on ivory. */}
      <img
        src="/art/poster-art-600.webp"
        srcSet="/art/poster-art-600.webp 600w, /art/poster-art-900.webp 900w"
        sizes="(min-width: 1280px) 200px, (min-width: 768px) 30vw, 45vw"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Per-category tint — one accent per poster, warmed toward gold. */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 16%, transparent) 0%, transparent 38%, color-mix(in srgb, var(--gold-metal) 14%, transparent) 100%)`,
        }}
      />
      <span aria-hidden className="poster-shine" />

      {/* Poster anatomy — genre / title / premiere strip, all HTML text. */}
      <span className="relative z-[1] flex h-full flex-col justify-between p-3 text-center sm:p-4">
        <span
          className="mx-auto font-mono text-[9px] font-semibold uppercase tracking-[0.22em] sm:text-[10px]"
          style={{
            color: accent,
            textShadow: "0 0 8px rgba(251,248,241,0.9)",
          }}
        >
          {feature.category}
        </span>

        <span className="mt-auto flex flex-col items-center gap-2 pb-1">
          <span className="font-display text-[15px] font-medium leading-[1.12] tracking-[-0.01em] text-cream [text-wrap:balance] line-clamp-3 sm:text-[17px]">
            {feature.name}
          </span>
          <span className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-cream/70 sm:text-[9px]">
            Premiered {fmtMonthDayYearUTC(feature.releaseDate)}
          </span>
          <span
            className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.16em] sm:text-[9px] ${RATING_CLASS[feature.status]}`}
          >
            {RATING_LABEL[feature.status]}
          </span>
        </span>
      </span>
    </Link>
  );
}
