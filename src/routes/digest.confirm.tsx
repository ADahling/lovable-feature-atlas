import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, X, Loader2 } from "lucide-react";
import { confirmDigestSubscription } from "../lib/digest.functions";
import { buildCanonicalTags } from "../lib/canonical-meta";
import { trackEvent } from "../lib/analytics";

const canonical = buildCanonicalTags({ path: "/digest/confirm" });

export const Route = createFileRoute("/digest/confirm")({
  head: () => ({
    meta: [
      { title: "Confirm subscription — The Lovable Feature Atlas" },
      { name: "description", content: "Confirm your subscription to What Lovable Shipped, the weekly digest from the Lovable Feature Atlas." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Confirm subscription — The Lovable Feature Atlas" },
      { property: "og:description", content: "Confirm your subscription to What Lovable Shipped, the weekly Lovable feature digest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Confirm subscription — The Lovable Feature Atlas" },
      { name: "twitter:description", content: "Confirm your subscription to What Lovable Shipped." },
      ...canonical.meta,
    ],
    links: canonical.links,
  }),
  component: ConfirmPage,
  validateSearch: (s: Record<string, unknown>): { token?: string } => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
});

function ConfirmPage() {
  const { token } = Route.useSearch();
  const confirm = useServerFn(confirmDigestSubscription);
  const [state, setState] = useState<"loading" | "confirmed" | "already" | "invalid">("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await confirm({ data: { token } });
        if (cancelled) return;
        setState(res.ok ? res.state === "already" ? "already" : "confirmed" : "invalid");
      } catch {
        if (!cancelled) setState("invalid");
      }
    })();
    return () => { cancelled = true; };
  }, [token, confirm]);

  return (
    <main className="relative min-h-[80vh] bg-ink text-cream">
      <section className="container-atlas flex min-h-[80vh] flex-col items-center justify-center py-24 text-center">
        <p className="t-eyebrow text-emerald">What Lovable Shipped</p>
        {state === "loading" && (
          <>
            <Loader2 className="mt-6 size-8 animate-spin text-cream/60" aria-hidden />
            <h1 className="t-title mt-6 text-cream">Confirming…</h1>
          </>
        )}
        {state === "confirmed" && (
          <>
            <div className="mt-6 flex size-14 items-center justify-center rounded-full border border-emerald/50 bg-emerald/10">
              <Check className="size-6 text-emerald" aria-hidden />
            </div>
            <h1 className="t-title mt-6 text-cream">You're on the list.</h1>
            <p className="t-body mt-4 max-w-md text-cream/70">The next digest lands Monday at 13:00 UTC — every new Lovable feature from the week, nothing else.</p>
          </>
        )}
        {state === "already" && (
          <>
            <div className="mt-6 flex size-14 items-center justify-center rounded-full border border-gold/50 bg-gold/10">
              <Check className="size-6 text-gold" aria-hidden />
            </div>
            <h1 className="t-title mt-6 text-cream">Already confirmed.</h1>
            <p className="t-body mt-4 max-w-md text-cream/70">You're already subscribed to What Lovable Shipped.</p>
          </>
        )}
        {state === "invalid" && (
          <>
            <div className="mt-6 flex size-14 items-center justify-center rounded-full border border-cream/25 bg-cream/5">
              <X className="size-6 text-cream/60" aria-hidden />
            </div>
            <h1 className="t-title mt-6 text-cream">This link isn't valid.</h1>
            <p className="t-body mt-4 max-w-md text-cream/70">The confirmation link may have expired or already been used. Subscribe again from the site footer.</p>
          </>
        )}
        <Link to="/" className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/60 hover:text-cream">← Back to the atlas</Link>
      </section>
    </main>
  );
}
