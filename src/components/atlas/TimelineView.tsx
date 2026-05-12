import { useMemo } from "react";
import { motion } from "framer-motion";
import { type Feature } from "../../data/features";

interface TimelineViewProps {
  features: Feature[];
  onSelect: (f: Feature) => void;
}

const fmtMonthYearKey = (key: string) =>
  new Date(key + "-01").toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

const fmtDateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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

  let runningIndex = 0;

  return (
    <div className="flex flex-col gap-12">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[14px] uppercase tracking-[0.2em] text-gold whitespace-nowrap">
              {fmtMonthYearKey(group.key)}
            </span>
            <span aria-hidden className="h-px flex-1 bg-emerald/20" />
          </div>
          <div className="flex flex-col gap-3">
            {group.items.map((feature) => {
              const i = runningIndex++;
              return (
                <motion.button
                  key={feature.id}
                  type="button"
                  onClick={() => onSelect(feature)}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.03,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex w-full min-h-[88px] items-center gap-4 rounded-xl border border-cream/10 bg-ink px-4 py-4 text-left transition-colors duration-300 hover:border-emerald/40"
                >
                  <span
                    aria-hidden
                    className={"inline-block size-1.5 shrink-0 rounded-full " + statusDotClass[feature.status]}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="font-sans text-[16px] font-semibold text-cream truncate">
                      {feature.name}
                    </h3>
                    <p className="font-sans text-[13px] text-cream/60 line-clamp-1">
                      {feature.tagline}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={
                        "font-mono text-[10px] uppercase tracking-[0.2em] " +
                        statusPillStyles[feature.status]
                      }
                    >
                      {feature.status}
                    </span>
                    <span className="font-mono text-[11px] uppercase text-cream/55">
                      {fmtDateShort(feature.releaseDate)}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
