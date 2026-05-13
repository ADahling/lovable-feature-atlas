import { Globe, Linkedin, Mail } from "lucide-react";
import { LovableHeart } from "./LovableHeart";
import { useFeatures } from "../../hooks/use-features";

function fmtUpdated(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

export function Footer() {
  const { generatedAt, source } = useFeatures();
  return (
    <footer className="relative border-t border-emerald/15 bg-ink px-6 py-8 text-cream/55 lg:px-12">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <LovableHeart className="size-5" />
            <span className="font-sans text-[13px] tracking-tight text-cream/70">
              Lovable Feature Atlas
            </span>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream/55">
            {source === "live" && generatedAt
              ? `Last updated ${fmtUpdated(generatedAt)} · 12:00 UTC`
              : "Curated catalog · Live sync pending"}
          </div>
        </div>
        <div className="my-6 border-t border-emerald/15" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-sans text-[12px] text-cream/55">
            Built by{" "}
            <a
              href="https://dahlingdigital.com"
              target="_blank"
              rel="noopener"
              className="text-cream/80 hover:text-emerald underline-offset-4 hover:underline transition-colors"
            >
              Alicia Dahling
            </a>
            {" · "}© 2026 Alicia Dahling
          </div>
          <div className="flex items-center gap-4 text-cream/55">
            <a
              href="https://www.linkedin.com/in/alicia-dahling-mba-macc/"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
              className="hover:text-emerald transition-colors"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href="mailto:hello@dahlingdigital.com"
              aria-label="Email"
              className="hover:text-emerald transition-colors"
            >
              <Mail className="size-4" />
            </a>
            <a
              href="https://dahlingdigital.com"
              target="_blank"
              rel="noopener"
              aria-label="Website"
              className="hover:text-emerald transition-colors"
            >
              <Globe className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
