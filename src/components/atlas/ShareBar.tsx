import { useEffect, useState } from "react";
import { Check, Copy, Layers, Linkedin, Share2, Twitter } from "lucide-react";
import type { Feature } from "../../data/features";
import { indexFromId, svgMarkupToPngUrl } from "../../lib/tarot-card";
import { CARD_W, CARD_H } from "./TarotCard";
import { trackEvent } from "../../lib/analytics";

interface ShareBarProps {
  url: string;
  title: string;
  hook?: string;
  variant?: "default" | "slim";
  className?: string;
  /**
   * When provided, the bar shows a quiet "Draw as card" action that
   * renders the feature's tarot card as a high-res PNG using the shared
   * tarot module.
   */
  feature?: Feature;
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

export function ShareBar({ url, title, hook, variant = "default", className, feature }: ShareBarProps) {
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
      trackEvent("share_clicked", { channel: "copy_link" });
    } catch {
      /* clipboard blocked — silent no-op */
    }
  }

  async function onNativeShare() {
    try {
      trackEvent("share_clicked", { channel: "native" });
      await navigator.share({ title, text: hook, url });
    } catch {
      /* user dismissed or unsupported */
    }
  }

  async function onDrawCard() {
    if (!feature) return;
    trackEvent("share_clicked", { channel: "card_png", feature: feature.id });
    try {
      const [{ renderToStaticMarkup }, { TarotCard }] = await Promise.all([
        import("react-dom/server"),
        import("./TarotCard"),
      ]);
      const markup = renderToStaticMarkup(
        <TarotCard feature={feature} index={indexFromId(feature.id)} faceUp />,
      );
      const pngUrl = await svgMarkupToPngUrl(markup, CARD_W, CARD_H, 2);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `atlas-card-${feature.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("[sharebar] draw as card failed", err);
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
        onClick={() => trackEvent("share_clicked", { channel: "x" })}
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
        onClick={() => trackEvent("share_clicked", { channel: "linkedin" })}
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

      {feature && (
        <button
          type="button"
          onClick={onDrawCard}
          className={btnClass}
          aria-label={`Draw ${feature.name} as a card`}
        >
          <Layers className={iconSize} aria-hidden />
          <span>Draw as card</span>
        </button>
      )}
    </div>
  );
}
