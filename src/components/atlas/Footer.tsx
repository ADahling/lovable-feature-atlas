import { Link } from "@tanstack/react-router";
import { LovableHeart } from "./LovableHeart";

interface FooterProps {
  generatedAt: string | null;
  source: "live" | "bundled";
}

function fmtUpdated(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function Footer({ generatedAt, source }: FooterProps) {
  return (
    <footer className="relative border-t border-emerald/15 bg-ink px-6 py-8 text-cream/55 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <LovableHeart className="size-5" />
          <span className="font-sans text-[13px] tracking-tight text-cream/70">
            Lovable Feature Atlas
          </span>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.15em]">
          {source === "live" && generatedAt ? (
            <Link
              to="/status"
              className="text-cream/55 transition-colors hover:text-cream"
            >
              Last updated {fmtUpdated(generatedAt)} · 12:00 UTC
            </Link>
          ) : (
            <span>Showing bundled snapshot — live data syncing</span>
          )}
        </div>
      </div>
    </footer>
  );
}
