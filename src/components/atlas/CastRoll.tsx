import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { FeatureCard as Feature } from "../../lib/features.functions";
import { categoryAccentVar } from "../../lib/category-theme";
import { fmtMonthYearUTC } from "../../lib/format-date";

const CONNECTOR_CATEGORIES = new Set(["App Connectors", "MCP Connectors"]);

/**
 * Starring: The Connectors — an end-credits ensemble cast roll. Every
 * connector in the catalog scrolls by in two counter-moving rows, in order
 * of first appearance. Hover or focus pauses the roll; each credit links
 * to the connector's catalog entry. Reduced motion: the rows stand still
 * and scroll natively.
 */
export function CastRoll({
  features,
  isComplete,
}: {
  features: Feature[];
  isComplete: boolean;
}) {
  const cast = useMemo(
    () =>
      features
        .filter((f) => CONNECTOR_CATEGORIES.has(f.category) && Boolean(f.releaseDate))
        .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate)),
    [features],
  );

  // Keyboard access: while any credit link holds focus the marquee freezes
  // into natural flow, so tabbing reaches every credit and scroll-on-focus
  // works. Resumes when focus leaves.
  const [frozen, setFrozen] = useState(false);

  if (cast.length < 4) return null;

  const mid = Math.ceil(cast.length / 2);
  const rows: [Feature[], Feature[]] = [cast.slice(0, mid), cast.slice(mid)];

  return (
    <section aria-labelledby="cast-roll-title" className="overflow-hidden border-b border-line">
      <div className="container-atlas section-y-sm pt-16 lg:pt-20">
        <div className="mb-2 text-center">
          <p className="t-eyebrow text-gold">Starring</p>
          <h2 id="cast-roll-title" className="t-title mt-3 text-cream">
            An ensemble cast of connectors.
          </h2>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/60">
            In order of appearance{isComplete ? ` · ${cast.length} credits` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-6 pt-6">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={"cast-marquee-viewport overflow-hidden" + (frozen ? " marquee-frozen" : "")}
            onFocusCapture={() => setFrozen(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFrozen(false);
            }}
            style={
              frozen
                ? undefined
                : {
                    maskImage:
                      "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
                  }
            }
          >
            <div
              className="cast-marquee"
              data-direction={rowIndex === 0 ? "left" : "right"}
              style={
                {
                  "--marquee-duration": `${Math.max(40, row.length * 6)}s`,
                } as React.CSSProperties
              }
            >
              <CastRowContent row={row} />
              {/* Seamless loop copy — hidden from the accessibility tree. */}
              <CastRowContent row={row} ariaHidden />
            </div>
          </div>
        ))}
      </div>

      <div className="container-atlas pb-16 lg:pb-20">
        <p className="mx-auto max-w-3xl text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-cream/60">
          This site is built on Lovable. The cast you&rsquo;re watching powers the platform the
          Atlas catalogs — every credit links to its full record.
        </p>
      </div>
    </section>
  );
}

function CastRowContent({ row, ariaHidden = false }: { row: Feature[]; ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="m-0 flex list-none items-center gap-0 p-0"
    >
      {row.map((f) => {
        const accent = categoryAccentVar(f.category);
        const name = f.name.replace(/\s*[Cc]onnector$/, "");
        return (
          <li key={f.id} className="m-0 p-0">
            <Link
              to="/features/$slug"
              params={{ slug: f.id }}
              tabIndex={ariaHidden ? -1 : undefined}
              className="group mx-6 inline-flex items-baseline gap-3 whitespace-nowrap py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              <span
                aria-hidden
                className="inline-block size-1.5 translate-y-[-2px] rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span className="font-display text-xl font-medium tracking-[-0.01em] text-cream transition-colors group-hover:text-gold sm:text-2xl">
                {name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/60">
                {fmtMonthYearUTC(f.releaseDate)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
