import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, X, Loader2 } from "lucide-react";
import { unsubscribeFromDigest, unsubscribeByEmail } from "../lib/digest.functions";
import { buildCanonicalTags } from "../lib/canonical-meta";

const canonical = buildCanonicalTags({ path: "/digest/unsubscribe" });

export const Route = createFileRoute("/digest/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Unsubscribe — What Lovable Shipped" },
      { name: "description", content: "Unsubscribe from the weekly What Lovable Shipped digest." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Unsubscribe — What Lovable Shipped" },
      { property: "og:description", content: "Unsubscribe from the weekly What Lovable Shipped digest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Unsubscribe — What Lovable Shipped" },
      { name: "twitter:description", content: "Unsubscribe from the weekly What Lovable Shipped digest." },
      ...canonical.meta,
    ],
    links: canonical.links,
  }),
  component: UnsubscribePage,
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const unsub = useServerFn(unsubscribeFromDigest);
  const unsubEmail = useServerFn(unsubscribeByEmail);
  const [state, setState] = useState<"idle" | "loading" | "done" | "already" | "invalid">("idle");
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "loading" | "done">("idle");

  async function onClick() {
    if (!token) { setState("invalid"); return; }
    setState("loading");
    try {
      const res = await unsub({ data: { token } });
      setState(res.ok ? (res.state === "already" ? "already" : "done") : "invalid");
    } catch {
      setState("invalid");
    }
  }

  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(trimmed)) return;
    setEmailState("loading");
    try { await unsubEmail({ data: { email: trimmed } }); } catch { /* silent */ }
    setEmailState("done");
  }

  return (
    <main className="relative min-h-[80vh] bg-ink text-cream">
      <section className="container-atlas flex min-h-[80vh] flex-col items-center justify-center py-24 text-center">
        <p className="t-eyebrow text-emerald">What Lovable Shipped</p>
        {(state === "idle" || state === "loading") && (
          <>
            <h1 className="t-title mt-6 text-cream">Unsubscribe from the weekly digest?</h1>
            <p className="t-body mt-4 max-w-md text-cream/70">One click and you're off the list. You can always resubscribe from the site footer.</p>
            <button
              type="button"
              onClick={onClick}
              disabled={state === "loading" || !token}
              className="mt-8 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-cream/25 bg-cream/5 px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream hover:bg-cream/10 disabled:opacity-50"
            >
              {state === "loading" ? <><Loader2 className="size-3.5 animate-spin" /> Unsubscribing</> : "Unsubscribe"}
            </button>
          </>
        )}
        {state === "done" && (
          <>
            <div className="mt-6 flex size-14 items-center justify-center rounded-full border border-emerald/50 bg-emerald/10">
              <Check className="size-6 text-emerald" aria-hidden />
            </div>
            <h1 className="t-title mt-6 text-cream">You're unsubscribed.</h1>
            <p className="t-body mt-4 max-w-md text-cream/70">You won't receive any more digests. Thanks for reading.</p>
          </>
        )}
        {state === "already" && (
          <>
            <div className="mt-6 flex size-14 items-center justify-center rounded-full border border-gold/50 bg-gold/10">
              <Check className="size-6 text-gold" aria-hidden />
            </div>
            <h1 className="t-title mt-6 text-cream">Already unsubscribed.</h1>
          </>
        )}
        {state === "invalid" && (
          <>
            <div className="mt-6 flex size-14 items-center justify-center rounded-full border border-cream/25 bg-cream/5">
              <X className="size-6 text-cream/60" aria-hidden />
            </div>
            <h1 className="t-title mt-6 text-cream">This link isn't valid.</h1>
            <p className="t-body mt-4 max-w-md text-cream/70">The unsubscribe link may have expired. Use the form below to unsubscribe by email instead.</p>
          </>
        )}

        {/* Email fallback: always available in case the token is missing or expired. */}
        <div className="mt-14 w-full max-w-md border-t border-cream/10 pt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/50">No link? Unsubscribe by email</p>
          {emailState === "done" ? (
            <p className="t-body mt-4 text-cream/70">If that address is on the list, it's been removed. You won't hear from us again.</p>
          ) : (
            <form onSubmit={onSubmitEmail} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address to unsubscribe"
                className="flex-1 rounded-md border border-cream/20 bg-cream/5 px-3 py-2 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-emerald"
              />
              <button
                type="submit"
                disabled={emailState === "loading"}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-cream/25 bg-cream/5 px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream hover:bg-cream/10 disabled:opacity-50"
              >
                {emailState === "loading" ? <><Loader2 className="size-3.5 animate-spin" /> Removing</> : "Remove me"}
              </button>
            </form>
          )}
        </div>

        <Link to="/" className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/60 hover:text-cream">← Back to the atlas</Link>
      </section>
    </main>
  );
}

