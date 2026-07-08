import { useEffect, useState } from "react";
import { Check, Copy, Linkedin, Share2, Twitter } from "lucide-react";

interface ShareBarProps {
  url: string;
  title: string;
  hook?: string;
  variant?: "default" | "slim";
  className?: string;
}

const VIA = "via The Lovable Feature Atlas";

function buildTweet(title: string, hook: string | undefined, url: string): string {
  const line = hook ? `${title} — ${hook}` : title;
  const params = new URLSearchParams({ text: `${line} ${VIA}`, url });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function buildLinkedIn(url: string): string {
  const params = new URLSearchParams({ url });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

export function ShareBar({ url, title, hook, variant = "default", className }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* clipboard blocked — silent no-op */
    }
  }

  async function onNativeShare() {
    try {
      await navigator.share({ title, text: hook, url });
    } catch {
      /* user dismissed or unsupported */
    }
  }

  const isSlim = variant === "slim";
  const btnBase =
    "group inline-flex items-center gap-2 rounded-md border border-cream/12 bg-transparent px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/75 transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink";
  const btnSlim = isSlim ? "px-2.5 py-1.5 text-[10px]" : "";
  const iconSize = isSlim ? "size-3.5" : "size-4";
  const btnClass = `${btnBase} ${btnSlim}`.trim();

  return (
    <div
      className={
        "flex flex-wrap items-center gap-2 " + (className ?? "")
      }
      role="group"
      aria-label="Share this page"
    >
      <button
        type="button"
        onClick={onCopy}
        className={btnClass}
        aria-live="polite"
        aria-label={copied ? "Link copied" : "Copy link"}
      >
        {copied ? (
          <Check className={iconSize + " text-emerald"} aria-hidden />
        ) : (
          <Copy className={iconSize} aria-hidden />
        )}
        <span>{copied ? "Copied" : "Copy link"}</span>
      </button>

      {/* X / LinkedIn: always visible on desktop.
          On mobile, collapse behind native share when available. */}
      <a
        href={buildTweet(title, hook, url)}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass + (canNativeShare ? " hidden sm:inline-flex" : "")}
        aria-label={`Share ${title} on X`}
      >
        <Twitter className={iconSize} aria-hidden />
        <span>Post on X</span>
      </a>

      <a
        href={buildLinkedIn(url)}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass + (canNativeShare ? " hidden sm:inline-flex" : "")}
        aria-label={`Share ${title} on LinkedIn`}
      >
        <Linkedin className={iconSize} aria-hidden />
        <span>LinkedIn</span>
      </a>

      {canNativeShare && (
        <button
          type="button"
          onClick={onNativeShare}
          className={btnClass + " sm:hidden"}
          aria-label="Share via device"
        >
          <Share2 className={iconSize} aria-hidden />
          <span>Share</span>
        </button>
      )}
    </div>
  );
}
