import { useState } from "react";
import { ArrowRight, Check, Copy, Globe, Linkedin, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SubscribeForm } from "./SubscribeForm";
import { LOVABLE_AFFILIATE_HREF } from "../../lib/category-theme";
import { BUILD_COMMIT, BUILD_TIME } from "../../lib/build-info";

const MCP_SNIPPET = '{ "url": "https://atlas.dahlingdigital.com/mcp" }';

function CreditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="m-0 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/55">
        {label}
      </p>
      <div className="font-display text-lg font-medium tracking-[-0.01em] text-cream sm:text-xl">
        {children}
      </div>
    </div>
  );
}

/**
 * Credits — the footer as an end-credits roll on ivory. Centered mono
 * labels over Fraunces names, The Premiere newsletter, the MCP block for
 * AI agents, and the double-feature comparison links. Nothing dark.
 */
export function Footer() {
  const [mcpCopied, setMcpCopied] = useState(false);

  async function copyMcp() {
    try {
      await navigator.clipboard.writeText(MCP_SNIPPET);
      setMcpCopied(true);
      window.setTimeout(() => setMcpCopied(false), 1800);
    } catch {
      /* clipboard blocked — the snippet is selectable text */
    }
  }

  return (
    <footer className="relative border-t border-line bg-ink py-16 text-cream/75">
      <div className="container-atlas flex flex-col items-center gap-12">
        {/* THE PREMIERE — the weekly newsletter as the marquee credit. */}
        <section
          aria-labelledby="premiere-title"
          className="w-full max-w-2xl border border-line bg-muted-ink px-6 py-8 text-center sm:px-10"
          style={{ borderRadius: 6 }}
        >
          <p className="t-eyebrow text-gold">The Premiere</p>
          <h2 id="premiere-title" className="mt-3 font-display text-2xl font-medium text-cream">
            One email a week. Every new feature. Nothing else.
          </h2>
          <div className="mx-auto mt-5 max-w-md text-left">
            <SubscribeForm variant="compact" source="footer" />
          </div>
          <Link
            to="/digest"
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/65 transition-colors hover:text-gold"
          >
            Browse past issues →
          </Link>
        </section>

        {/* Credit roll */}
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          <CreditRow label="Curated by">
            <a
              href="https://dahlingdigital.com"
              target="_blank"
              rel="noopener"
              className="underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              Alicia Dahling
            </a>
          </CreditRow>

          <CreditRow label="Data">
            <span className="text-base sm:text-lg">
              <a
                href="https://docs.lovable.dev"
                target="_blank"
                rel="noopener"
                className="underline underline-offset-4 transition-colors hover:text-gold"
              >
                docs.lovable.dev
              </a>
              <span className="text-cream/70"> — checked nightly against official sources</span>
            </span>
          </CreditRow>

          <CreditRow label="Built with">
            <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-base sm:text-lg">
              <a
                href={LOVABLE_AFFILIATE_HREF}
                target="_blank"
                rel="sponsored noopener"
                className="underline-offset-4 transition-colors hover:text-gold hover:underline"
              >
                Lovable
              </a>
              <span aria-hidden className="text-gold-metal">·</span>
              <span>Cloud data</span>
              <span aria-hidden className="text-gold-metal">·</span>
              <span>Nightly refresh jobs</span>
              <span aria-hidden className="text-gold-metal">·</span>
              <span>The weekly digest</span>
            </span>
          </CreditRow>

          {/* FOR AI AGENTS — the public MCP endpoint, copy-ready. */}
          <div className="flex w-full flex-col items-center gap-2" id="mcp-credit">
            <p className="m-0 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/55">
              For AI agents
            </p>
            <div className="flex w-full max-w-md items-center gap-2 rounded-md border border-line bg-muted-ink px-3 py-2.5">
              <code className="min-w-0 flex-1 truncate text-left font-mono text-[12px] text-cream/85">
                {MCP_SNIPPET}
              </code>
              <button
                type="button"
                onClick={copyMcp}
                aria-label={mcpCopied ? "MCP endpoint copied" : "Copy MCP endpoint"}
                className="grid size-8 shrink-0 place-items-center rounded border border-line text-cream/70 transition-colors hover:border-gold-deep hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              >
                {mcpCopied ? (
                  <Check className="size-3.5 text-emerald" aria-hidden />
                ) : (
                  <Copy className="size-3.5" aria-hidden />
                )}
              </button>
            </div>
            <Link
              to="/about"
              hash="mcp"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/60 transition-colors hover:text-gold"
            >
              How agents use the Atlas →
            </Link>
          </div>

          {/* Double features */}
          <div className="flex flex-col items-center gap-2">
            <p className="m-0 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/55">
              Double features
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link
                to="/vs/cursor"
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/75 transition-colors hover:text-gold"
              >
                Lovable vs Cursor
              </Link>
              <span aria-hidden className="text-cream/30">·</span>
              <Link
                to="/vs/v0"
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/75 transition-colors hover:text-gold"
              >
                Lovable vs v0
              </Link>
            </div>
          </div>

          <a
            href={LOVABLE_AFFILIATE_HREF}
            target="_blank"
            rel="sponsored noopener"
            className="btn-foil inline-flex items-center gap-2 rounded-md px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Start building on Lovable
            <ArrowRight className="size-3.5" aria-hidden />
          </a>

          <div className="flex items-center gap-5 text-cream/70">
            <a
              href="https://www.linkedin.com/in/alicia-dahling-mba-macc/"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
              className="transition-colors hover:text-gold"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href="mailto:hello@dahlingdigital.com"
              aria-label="Email"
              className="transition-colors hover:text-gold"
            >
              <Mail className="size-4" />
            </a>
            <a
              href="https://dahlingdigital.com"
              target="_blank"
              rel="noopener"
              aria-label="Website"
              className="transition-colors hover:text-gold"
            >
              <Globe className="size-4" />
            </a>
          </div>
        </div>

        {/* Disclosure + utility line */}
        <div className="flex w-full flex-col items-center gap-3 border-t border-line pt-8 text-center">
          <p className="m-0 max-w-2xl text-[13px] leading-relaxed text-cream/70">
            An independent, fan-built reference for the Lovable community. Product names, logos,
            and feature descriptions belong to Lovable AB. Not affiliated with, endorsed by, or
            maintained by Lovable AB.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <p className="m-0 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/65">
              © 2026 Alicia Dahling · Dahling Digital
            </p>
            <span aria-hidden className="font-mono text-[11px] text-cream/30">·</span>
            <Link
              to="/about"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/65 transition-colors hover:text-gold"
            >
              About
            </Link>
            <span aria-hidden className="font-mono text-[11px] text-cream/30">·</span>
            <Link
              to="/status"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/65 transition-colors hover:text-gold"
            >
              Site status
            </Link>
            <span aria-hidden className="font-mono text-[11px] text-cream/30">·</span>
            <span
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/55"
              title={`Built ${BUILD_TIME}`}
              data-build-commit={BUILD_COMMIT}
              data-build-time={BUILD_TIME}
            >
              Build {BUILD_COMMIT}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
