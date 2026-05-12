import { ExternalLink, X } from "lucide-react";
import { type Feature } from "../../data/features";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { fmtMonthYearUTC } from "../../lib/format-date";

interface FeatureDialogProps {
  feature: Feature | null;
  onOpenChange: (open: boolean) => void;
}

const fmtMonthYear = fmtMonthYearUTC;

const statusDotClass: Record<Feature["status"], string> = {
  GA: "bg-emerald",
  Beta: "bg-gold",
  Removed: "bg-cream/40",
};

const statusTextClass: Record<Feature["status"], string> = {
  GA: "text-emerald",
  Beta: "text-gold",
  Removed: "text-cream/55",
};

export function FeatureDialog({ feature, onOpenChange }: FeatureDialogProps) {
  const open = feature !== null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="relative max-w-2xl bg-ink/85 backdrop-blur-md border border-emerald/30 text-cream"
      >
        {feature && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55">
              <span
                aria-hidden
                className={"inline-block size-1.5 rounded-full mr-3 " + statusDotClass[feature.status]}
              />
              <span className={statusTextClass[feature.status]}>{feature.status}</span>
            </div>

            <DialogTitle asChild>
              <h2 className="font-sans text-[32px] font-semibold leading-tight text-cream">
                {feature.name}
              </h2>
            </DialogTitle>

            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream/55">
              {feature.category} · {fmtMonthYear(feature.releaseDate)}
            </p>

            <div className="h-px w-full bg-emerald/20" />

            <DialogDescription asChild>
              <p className="font-sans text-[15px] leading-relaxed text-cream/80">
                {feature.description}
              </p>
            </DialogDescription>

            <section className="flex flex-col gap-2">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-gold">
                Capabilities
              </h3>
              <ul className="flex flex-col gap-2">
                {feature.capabilities.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald"
                    />
                    <span className="font-sans text-[14px] text-cream">{c}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-gold">
                Use cases
              </h3>
              <ul className="flex flex-col gap-2">
                {feature.useCases.map((u, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald"
                    />
                    <span className="font-sans text-[14px] text-cream">{u}</span>
                  </li>
                ))}
              </ul>
            </section>

            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-cream/20 text-cream/70 transition-colors hover:border-emerald hover:text-cream"
            >
              <X className="size-4" aria-hidden />
            </button>

            <div className="flex items-center justify-between gap-4 pt-2">
              <span className="rounded border border-emerald/30 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-cream/70">
                {feature.pricing}
              </span>
              <a
                href={feature.source}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold/20"
              >
                View on docs.lovable.dev
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
