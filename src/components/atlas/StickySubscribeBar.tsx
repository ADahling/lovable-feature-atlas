import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { subscribeToDigest } from "../../lib/digest.functions";
import { trackEvent } from "../../lib/analytics";

interface Props {
  source: "feature" | "home";
  context?: string;
  /** Storage key suffix so different placements dismiss independently. */
  storageKey?: string;
}

const SHOW_AFTER_PX = 600;

/**
 * Persistent, dismissible bottom subscribe bar. Appears after the visitor
 * scrolls past the hero region and stays pinned until they subscribe or
 * dismiss it. Dismissal is per-session so returning visitors see it again.
 */
export function StickySubscribeBar({ source, context, storageKey }: Props) {
  const subscribe = useServerFn(subscribeToDigest);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const dismissKey = `atlas-sticky-cta-dismissed:${storageKey ?? source}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(dismissKey) === "1") return;
    } catch {
      // storage disabled — still show
    }

    let shown = false;
    function onScroll() {
      if (shown) return;
      if (window.scrollY > SHOW_AFTER_PX) {
        shown = true;
        setVisible(true);
        trackEvent("Subscribe Viewed", { source, context, placement: "sticky-bar" });
        window.removeEventListener("scroll", onScroll);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissKey, source, context]);

  function dismiss() {
    setVisible(false);
    try { sessionStorage.setItem(dismissKey, "1"); } catch { /* ignore */ }
    trackEvent("Subscribe Dismissed", { source, context, placement: "sticky-bar" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    setState("loading");
    trackEvent("Subscribe Submitted", { source, context, placement: "sticky-bar" });
    try {
      const res = await subscribe({ data: { email: email.trim().toLowerCase(), source } });
      if (res.ok) {
        setState("success");
        setMessage(res.message);
        setEmail("");
        trackEvent("Subscribe Success", { source, context, placement: "sticky-bar" });
        setTimeout(() => setVisible(false), 4000);
      } else {
        setState("error");
        setMessage(res.message);
        trackEvent("Subscribe Error", { source, context, placement: "sticky-bar", reason: "validation" });
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
      trackEvent("Subscribe Error", { source, context, placement: "sticky-bar", reason: "network" });
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Subscribe to the weekly Lovable digest"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/15 bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/85 print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="container-atlas flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-emerald sm:inline">
            Weekly digest
          </span>
          <p className="min-w-0 text-[13px] leading-snug text-cream/85">
            <span className="font-medium text-cream">Every new Lovable feature.</span>{" "}
            <span className="text-cream/60">One email a week. No spam.</span>
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-1 items-center gap-2 sm:max-w-md" noValidate>
          <label className="sr-only" htmlFor={`sticky-subscribe-${source}`}>Email address</label>
          <input
            id={`sticky-subscribe-${source}`}
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state !== "loading") setState("idle"); }}
            disabled={state === "loading" || state === "success"}
            className="min-h-[40px] flex-1 rounded-md border border-cream/25 bg-ink/70 px-3 font-mono text-[13px] text-cream placeholder:text-cream/50 outline-none transition-colors focus-visible:border-gold/70 focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={state === "loading" || state === "success" || email.trim().length < 5}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md border border-gold/50 bg-gold/15 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "loading" && <><Loader2 className="size-3.5 animate-spin" aria-hidden /> Sending</>}
            {state === "success" && <><Check className="size-3.5" aria-hidden /> Sent</>}
            {(state === "idle" || state === "error") && <>Subscribe <ArrowRight className="size-3.5" aria-hidden /></>}
          </button>
        </form>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss subscribe bar"
          className="absolute right-2 top-2 rounded-md p-1.5 text-cream/50 hover:bg-cream/10 hover:text-cream sm:static sm:shrink-0"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      {message && (
        <div
          role={state === "error" ? "alert" : "status"}
          aria-live={state === "error" ? "assertive" : "polite"}
          className={`container-atlas pb-3 text-[12px] ${state === "error" ? "text-danger" : "text-emerald"}`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
