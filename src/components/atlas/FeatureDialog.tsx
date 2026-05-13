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
        className="bg-ink/95 backdrop-blur-md border border-emerald/30 text-cream w-screen h-[100dvh] max-w-none rounded-none p-5 overflow-y-auto sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-2xl sm:rounded-lg sm:p-6"
      >
        {feature && (
          <div className="flex flex-col gap-5 pr-10">
            <div className="t-label flex items-center text-cream/55">
              <span
                aria-hidden
                className={"inline-block size-1.5 rounded-full mr-3 " + statusDotClass[feature.status]}
              />
              <span className={statusTextClass[feature.status]}>{feature.status}</span>
              <span className="mx-3 text-cream/30">/</span>
              <span className="text-cream/70">{feature.category}</span>
              <span className="mx-3 text-cream/30">/</span>
              <span className="font-mono text-cream/70">{fmtMonthYear(feature.releaseDate)}</span>
            </div>

            <DialogTitle asChild>
              <h2 className="t-title text-cream">
                {feature.name}
              </h2>
            </DialogTitle>

            <div className="h-px w-full bg-emerald/20" />

            <DialogDescription asChild>
              <p className="t-body text-cream/80">
                {feature.description}
              </p>
            </DialogDescription>

            <section className="flex flex-col gap-2">
              <h3 className="t-eyebrow text-emerald">
                Capabilities
              </h3>
              <ul className="flex flex-col gap-2">
                {feature.capabilities.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald"
                    />
                    <span className="t-body text-cream">{c}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="t-eyebrow text-emerald">
                Use cases
              </h3>
              <ul className="flex flex-col gap-2">
                {feature.useCases.map((u, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald"
                    />
                    <span className="t-body text-cream">{u}</span>
                  </li>
                ))}
              </ul>
            </section>

            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 grid size-11 place-items-center rounded-full border border-cream/20 text-cream/70 transition-colors hover:border-emerald hover:text-cream sm:right-4 sm:top-4"
            >
              <X className="size-5" aria-hidden />
            </button>

            <div className="flex items-center justify-between gap-4 pt-2">
              <span className="t-label rounded border border-emerald/30 px-2 py-1 text-cream/70">
                {feature.pricing}
              </span>
              <a
                href={feature.source}
                target="_blank"
                rel="noopener"
                className="t-label inline-flex items-center gap-2 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-2 text-emerald transition-colors hover:bg-emerald/20"
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
