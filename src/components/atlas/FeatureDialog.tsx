import { ExternalLink } from "lucide-react";
import { type Feature } from "../../data/features";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface FeatureDialogProps {
  feature: Feature | null;
  onOpenChange: (open: boolean) => void;
}

const fmtMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });

const statusPillStyles: Record<Feature["status"], string> = {
  GA: "bg-gold/15 text-gold",
  Beta: "bg-emerald/20 text-emerald",
  Removed: "bg-cream/15 text-cream/70",
};

export function FeatureDialog({ feature, onOpenChange }: FeatureDialogProps) {
  const open = feature !== null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl bg-ink/85 backdrop-blur-md border border-emerald/30 text-cream"
      >
        {feature && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span
                className={
                  "rounded-full px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] " +
                  statusPillStyles[feature.status]
                }
              >
                {feature.status}
              </span>
              <span className="text-[22px] leading-none" aria-hidden>
                {feature.icon}
              </span>
            </div>

            <DialogTitle asChild>
              <h2 className="font-sans text-[32px] font-semibold leading-tight text-cream">
                {feature.name}
              </h2>
            </DialogTitle>

            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream/55">
              {feature.category} · {fmtMonthYear(feature.releaseDate)}
            </p>

            <div className="h-px w-full" style={{ background: "rgba(31,122,90,0.2)" }} />

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
