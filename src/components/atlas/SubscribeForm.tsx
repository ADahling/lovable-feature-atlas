import { useEffect, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import { subscribeToDigest } from "../../lib/digest.functions";
import { trackEvent } from "../../lib/analytics";

interface Props {
  variant?: "compact" | "expanded";
  source: "footer" | "about" | "web" | "home" | "feature";
  /** Optional context for analytics props (e.g. feature slug). */
  context?: string;
}

export function SubscribeForm({ variant = "compact", source, context }: Props) {
  const subscribe = useServerFn(subscribeToDigest);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const isExpanded = variant === "expanded";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await subscribe({ data: { email: email.trim().toLowerCase(), source } });
      if (res.ok) {
        setState("success");
        setMessage(res.message);
        setEmail("");
      } else {
        setState("error");
        setMessage(res.message);
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className={isExpanded ? "flex flex-col gap-4" : "flex flex-col gap-3"}>
      {isExpanded && (
        <>
          <p className="t-eyebrow text-emerald">What Lovable Shipped</p>
          <h3 className="t-card text-cream">One email a week. Every new feature. Nothing else.</h3>
          <p className="t-body-sm text-cream/65 max-w-md">
            A curated Monday roundup of every Lovable feature added or promoted to GA in the past week — pulled straight from the atlas.
          </p>
        </>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate>
        <label className="sr-only" htmlFor={`subscribe-${source}`}>Email address</label>
        <input
          id={`subscribe-${source}`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          placeholder="you@company.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state !== "loading") setState("idle"); }}
          disabled={state === "loading" || state === "success"}
          className="min-h-[44px] flex-1 rounded-md border border-cream/25 bg-ink/60 px-3 py-2 font-mono text-[13px] text-cream placeholder:text-cream/60 outline-none transition-colors focus-visible:border-gold/70 focus-visible:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === "loading" || state === "success" || email.trim().length < 5}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-gold/50 bg-gold/10 px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "loading" && <><Loader2 className="size-3.5 animate-spin" aria-hidden /> Sending</>}
          {state === "success" && <><Check className="size-3.5" aria-hidden /> Sent</>}
          {(state === "idle" || state === "error") && <>Subscribe <ArrowRight className="size-3.5" aria-hidden /></>}
        </button>
      </form>
      {message && (
        <div
          role={state === "error" ? "alert" : "status"}
          aria-live={state === "error" ? "assertive" : "polite"}
          className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-[13px] leading-snug ${
            state === "error"
              ? "border-danger/50 bg-danger/10 text-danger"
              : "border-emerald/50 bg-emerald/10 text-emerald"
          }`}
        >
          {state === "error" ? (
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          )}
          <span className="font-medium">{message}</span>
        </div>
      )}
      <p className="t-body-sm text-cream/50 text-[12px] leading-relaxed">
        No spam. Unsubscribe anytime. Independent, not affiliated with Lovable AB.
      </p>
    </div>
  );
}
