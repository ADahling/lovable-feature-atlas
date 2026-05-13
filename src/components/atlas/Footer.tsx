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
    <footer className="relative border-t border-emerald/15 bg-ink py-10 text-cream/55">
      <div className="container-atlas">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <LovableHeart className="size-5" />
            <span className="t-body-sm tracking-tight text-cream/70">
              The Lovable Feature Atlas
            </span>
            <span className="t-label rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-gold">
              Community
            </span>
          </div>
          <div className="t-eyebrow text-cream/55">
            {source === "live" && generatedAt
              ? `Last updated ${fmtUpdated(generatedAt)} · 12:00 UTC`
              : "Curated catalog · Live sync pending"}
          </div>
        </div>
        <div className="my-6 border-t border-emerald/15" />
        <p className="t-body-sm max-w-3xl text-cream/55">
          An independent, fan-built reference for the Lovable community — built for ambassadors,
          enthusiasts, and people evaluating Lovable. Not affiliated with, endorsed by, or
          maintained by Lovable AB. All product names, logos, and feature descriptions belong to
          Lovable AB; this site links back to{" "}
          <a
            href="https://docs.lovable.dev"
            target="_blank"
            rel="noopener"
            className="text-cream/80 hover:text-emerald hover:underline underline-offset-4"
          >
            docs.lovable.dev
          </a>{" "}
          as the source of truth.
        </p>
        <div className="my-6 border-t border-emerald/15" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="t-body-sm text-cream/55">
            Built by{" "}
            <a
              href="https://dahlingdigital.com"
              target="_blank"
              rel="noopener"
              className="text-cream/80 hover:text-emerald underline-offset-4 hover:underline transition-colors"
            >
              Alicia Dahling
            </a>
            {" · "}© 2026 Alicia Dahling · Dahling Digital
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
