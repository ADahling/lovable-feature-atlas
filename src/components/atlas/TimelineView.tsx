import { useMemo } from "react";
import { motion } from "framer-motion";
import { type Feature } from "../../data/features";
import { fmtMonthDayYearUTC, fmtMonthYearFromKeyUTC } from "../../lib/format-date";

interface TimelineViewProps {
  features: Feature[];
  onSelect: (f: Feature) => void;
}

const fmtMonthYearKey = fmtMonthYearFromKeyUTC;
const fmtDateShort = fmtMonthDayYearUTC;

const statusDotClass: Record<Feature["status"], string> = {
  GA: "bg-emerald",
  Beta: "bg-gold",
  Removed: "bg-cream/40",
};

const statusPillStyles: Record<Feature["status"], string> = {
  GA: "text-emerald",
  Beta: "text-gold",
  Removed: "text-cream/55",
};

export function TimelineView({ features, onSelect }: TimelineViewProps) {
  const groups = useMemo(() => {
    const ordered: string[] = [];
    const map = new Map<string, Feature[]>();
    for (const f of features) {
      const key = f.releaseDate.slice(0, 7);
      if (!map.has(key)) {
        map.set(key, []);
        ordered.push(key);
      }
      map.get(key)!.push(f);
    }
    return ordered.map((key) => ({ key, items: map.get(key)! }));
  }, [features]);

  if (features.length === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="t-eyebrow text-cream/55">No features match</p>
        <p className="t-body text-cream/65">
          Try clearing a filter or widening your search.
        </p>
      </div>
    );

  return (
    <div className="relative flex flex-col gap-14">
      {groups.map((group, gi) => (
        <section key={group.key} className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <span aria-hidden className="size-2 rounded-full bg-gold ring-4 ring-gold/15" />
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-gold whitespace-nowrap m-0">
              {fmtMonthYearKey(group.key)}
            </h2>
            <span aria-hidden className="h-px flex-1 bg-emerald/20" />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/45">
              {group.items.length} release{group.items.length === 1 ? "" : "s"}
            </span>
          </div>
          {/* Rail + items */}
          <div className="relative flex flex-col gap-3 pl-6">
            <span
              aria-hidden
              className="absolute left-[3px] top-1 bottom-1 w-px bg-emerald/15"
            />
            {group.items.map((feature, ii) => {
              const i = Math.min(gi * 4 + ii, 8);
              return (
                <motion.button
                  key={feature.id}
                  type="button"
                  onClick={() => onSelect(feature)}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.035,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative flex w-full min-h-[80px] items-center gap-4 rounded-xl border border-emerald/20 bg-muted-ink/40 px-5 py-4 text-left transition-colors duration-300 hover:border-emerald/60 hover:bg-muted-ink/70"
                >
                  {/* Rail node */}
                  <span
                    aria-hidden
                    className={
                      "absolute -left-[27px] top-1/2 -translate-y-1/2 size-2 rounded-full ring-4 ring-ink " +
                      statusDotClass[feature.status]
                    }
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="t-card text-cream truncate">
                      {feature.name}
                    </h3>
                    <p className="t-body-sm text-cream/65 line-clamp-1">
                      {feature.tagline}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={"font-mono text-[11px] uppercase tracking-wider " + statusPillStyles[feature.status]}>
                      {feature.status}
                    </span>
                    <span className="font-mono text-[11px] text-cream/55">
                      {fmtDateShort(feature.releaseDate)}
                    </span>
                  </div>
                  <span aria-hidden className="ml-2 text-cream/30 transition-colors group-hover:text-emerald">→</span>
                </motion.button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
