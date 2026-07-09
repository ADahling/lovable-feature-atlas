import { ArrowRight, Globe, Linkedin, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LovableHeart } from "./LovableHeart";
import { useFeatures } from "../../hooks/use-features";
import { LOVABLE_AFFILIATE_HREF } from "../../lib/category-theme";

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
    <footer className="relative border-t border-emerald/20 bg-ink py-14 text-cream/55">
      <div className="container-atlas">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <LovableHeart className="size-6" />
              <span className="t-card tracking-tight text-cream">
                The Lovable Feature Atlas
              </span>
            </div>
            <p className="t-body-sm text-cream/65 max-w-md">
              An independent, fan-built reference for the Lovable community — for ambassadors,
              enthusiasts, and teams evaluating Lovable. Not affiliated with, endorsed by, or
              maintained by Lovable AB.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="t-label inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-gold">
                Community catalog
              </span>
              <Link
                to="/about"
                className="t-label rounded px-2 py-1 text-cream/70 hover:text-cream transition-colors"
              >
                About →
              </Link>
            </div>
            <a
              href={LOVABLE_AFFILIATE_HREF}
              target="_blank"
              rel="sponsored noopener"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-md border border-gold/50 bg-gold/5 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/15"
            >
              Start building on Lovable
              <ArrowRight className="size-3.5" aria-hidden />
            </a>
          </div>

          <div className="md:col-span-4 flex flex-col gap-3">
            <p className="t-eyebrow text-emerald">Source of truth</p>
            <p className="t-body-sm text-cream/65">
              Product names, logos, and feature descriptions belong to Lovable AB. Every entry links
              back to{" "}
              <a
                href="https://docs.lovable.dev"
                target="_blank"
                rel="noopener"
                className="text-cream/90 hover:text-emerald hover:underline underline-offset-4"
              >
                docs.lovable.dev
              </a>
              .
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/65">
              {source === "live" && generatedAt
                ? `Last updated ${fmtUpdated(generatedAt)} · 12:00 UTC`
                : "Curated catalog · Live sync pending"}
            </p>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3">
            <p className="t-eyebrow text-emerald">Curator</p>
            <a
              href="https://dahlingdigital.com"
              target="_blank"
              rel="noopener"
              className="t-body-sm text-cream hover:text-emerald underline-offset-4 hover:underline transition-colors w-fit"
            >
              Alicia Dahling
            </a>
            <p className="t-body-sm text-cream/55">Dahling Digital</p>
            <div className="mt-2 flex items-center gap-4 text-cream/55">
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

        <div className="mt-12 pt-6 border-t border-emerald/15 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/65">
            © 2026 Alicia Dahling · Dahling Digital
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/status"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/65 hover:text-cream/80 transition-colors"
            >
              Site status
            </Link>
            <span aria-hidden className="font-mono text-[11px] text-cream/25">·</span>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/65">
              Not affiliated with Lovable AB
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
