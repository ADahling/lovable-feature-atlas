import { useEffect, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { subscribeToDigest } from "../../lib/digest.functions";
import { trackEvent } from "../../lib/analytics";

interface Props {
  source: "home" | "feature";
  context?: string;
  /** Scroll depth (0-1) that triggers the prompt if exit-intent hasn't fired. */
  scrollTrigger?: number;
}

const DISMISS_KEY = "atlas-subscribe-prompt-dismissed";
// Suppress for 14 days after dismissal, 30 days after success.
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const SUCCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Exit-intent + scroll-triggered subscribe overlay. Fires whichever comes
 * first, once per visitor per TTL window. Desktop: mouseleave off the top
 * edge. Mobile / touch: scroll-depth threshold only.
 */
export function SubscribePrompt({ source, context, scrollTrigger = 0.6 }: Props) {
  const subscribe = useServerFn(subscribeToDigest);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const firedRef = useRef(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Suppression window.
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const until = Number(raw);
        if (Number.isFinite(until) && until > Date.now()) return;
      }
    } catch { /* ignore */ }

    // Give the page a beat before arming any triggers.
    const armTimer = window.setTimeout(arm, 8000);

    function fire(trigger: "exit-intent" | "scroll-depth") {
      if (firedRef.current) return;
      firedRef.current = true;
      cleanup();
      setOpen(true);
      trackEvent("Subscribe Viewed", { source, context, placement: "prompt", trigger });
    }

    function onMouseOut(e: MouseEvent) {
      if (e.relatedTarget || (e as MouseEvent & { toElement?: unknown }).toElement) return;
      if (e.clientY <= 0) fire("exit-intent");
    }

    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY / max >= scrollTrigger) fire("scroll-depth");
    }

    function arm() {
      document.addEventListener("mouseout", onMouseOut);
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    function cleanup() {
      window.clearTimeout(armTimer);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    }

    return cleanup;
  }, [source, context, scrollTrigger]);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close("keyboard");
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close(reason: "backdrop" | "button" | "keyboard" | "success") {
    setOpen(false);
    const ttl = reason === "success" ? SUCCESS_TTL_MS : DISMISS_TTL_MS;
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + ttl)); } catch { /* ignore */ }
    if (reason !== "success") {
      trackEvent("Subscribe Dismissed", { source, context, placement: "prompt", reason });
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    setState("loading");
    trackEvent("Subscribe Submitted", { source, context, placement: "prompt" });
    try {
      const res = await subscribe({ data: { email: email.trim().toLowerCase(), source } });
      if (res.ok) {
        setState("success");
        setMessage(res.message);
        setEmail("");
        trackEvent("Subscribe Success", { source, context, placement: "prompt" });
        setTimeout(() => close("success"), 2500);
      } else {
        setState("error");
        setMessage(res.message);
        trackEvent("Subscribe Error", { source, context, placement: "prompt", reason: "validation" });
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
      trackEvent("Subscribe Error", { source, context, placement: "prompt", reason: "network" });
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscribe-prompt-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close subscribe prompt"
        onClick={() => close("backdrop")}
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-cream/15 bg-ink p-6 shadow-2xl sm:p-8">
        <button
          ref={closeBtnRef}
          type="button"
          onClick={() => close("button")}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1.5 text-cream/60 transition-colors hover:bg-cream/10 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <X className="size-4" aria-hidden />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald">What Lovable Shipped</p>
        <h2 id="subscribe-prompt-title" className="mt-2 font-display text-xl font-semibold tracking-tight text-cream sm:text-2xl">
          Before you go — get the Monday digest.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-cream/70">
          Every new Lovable feature and beta, shipped or promoted to GA, in one email a week. Pulled straight from this atlas.
        </p>
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2 sm:flex-row" noValidate>
          <label className="sr-only" htmlFor={`prompt-subscribe-${source}`}>Email address</label>
          <input
            id={`prompt-subscribe-${source}`}
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state !== "loading") setState("idle"); }}
            disabled={state === "loading" || state === "success"}
            className="min-h-[44px] flex-1 rounded-md border border-cream/25 bg-ink/60 px-3 font-mono text-[13px] text-cream placeholder:text-cream/50 outline-none transition-colors focus-visible:border-gold/70 focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={state === "loading" || state === "success" || email.trim().length < 5}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-gold/50 bg-gold/15 px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "loading" && <><Loader2 className="size-3.5 animate-spin" aria-hidden /> Sending</>}
            {state === "success" && <><Check className="size-3.5" aria-hidden /> Sent</>}
            {(state === "idle" || state === "error") && <>Subscribe <ArrowRight className="size-3.5" aria-hidden /></>}
          </button>
        </form>
        {message && (
          <p
            role={state === "error" ? "alert" : "status"}
            aria-live={state === "error" ? "assertive" : "polite"}
            className={`mt-3 text-[13px] ${state === "error" ? "text-danger" : "text-emerald"}`}
          >
            {message}
          </p>
        )}
        <p className="mt-4 text-[11px] leading-relaxed text-cream/45">
          No spam. Unsubscribe anytime. Independent, not affiliated with Lovable AB.
        </p>
      </div>
    </div>
  );
}
