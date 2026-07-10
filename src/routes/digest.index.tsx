import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { listPublishedDigests, type ArchiveListItem } from "../lib/digest-archive.functions";
import { buildCanonicalTags, SITE_ORIGIN } from "../lib/canonical-meta";
import { SubscribeForm } from "../components/atlas/SubscribeForm";

const TITLE = "Digest archive — What Lovable Shipped";
const DESCRIPTION =
  "Every past issue of the weekly What Lovable Shipped digest. A permanent, week-by-week record of Lovable's shipped features.";

export const Route = createFileRoute("/digest/")({
  loader: async () => listPublishedDigests(),
  head: () => {
    const canonical = buildCanonicalTags({ path: "/digest" });
    const image = `${SITE_ORIGIN}/og-image.png`;
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
        ...canonical.meta,
      ],
      links: canonical.links,
    };
  },
  component: DigestArchiveIndex,
});

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  } catch { return iso; }
}

function SpecimenIssue() {
  return (
    <div className="atlas-frame max-w-none">
      <span className="atlas-frame-marks" aria-hidden />
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
            Specimen · Issue no. 001
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cream/55">
            Dated · <span className="text-cream/80">— — · — — · — —</span>
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/45">
          What Lovable Shipped
        </p>
      </div>
      <h2 className="mt-6 font-display text-2xl leading-tight tracking-tight text-cream md:text-3xl">
        A week's worth of shipped work, distilled.
      </h2>
      <div className="atlas-rule mt-6" aria-hidden />
      <ol className="mt-4 divide-y divide-cream/8">
        {[
          { tag: "AI Models", title: "— new capability lands here" },
          { tag: "Editor", title: "— refined workflow, one line" },
          { tag: "Cloud", title: "— platform change worth knowing" },
        ].map((row, i) => (
          <li key={i} className="grid grid-cols-[24px_120px_1fr_auto] items-baseline gap-3 py-3">
            <span className="font-mono text-[10px] tabular-nums text-cream/40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald/80">
              {row.tag}
            </span>
            <span className="text-[14px] text-cream/70">{row.title}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/40">
              →
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-[13px] leading-relaxed text-cream/50">
        Every issue: three to seven items, each one paragraph. No metrics, no chatter.
      </p>
    </div>
  );
}

function NotifyForm() {
  return (
    <form
      className="flex w-full flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const el = e.currentTarget.querySelector<HTMLInputElement>('input[name="email"]');
        if (el) el.value = "";
      }}
      aria-label="Notify me of issue one"
    >
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@studio.com"
        className="w-full flex-1 rounded-md border border-cream/15 bg-ink/60 px-4 py-3 font-mono text-sm text-cream placeholder:text-cream/35 focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/40"
      />
      <button
        type="submit"
        className="whitespace-nowrap rounded-md border border-gold/60 bg-gold/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold/20 focus:outline-none focus:ring-2 focus:ring-gold/40"
      >
        Notify me of issue one →
      </button>
    </form>
  );
}

function DigestArchiveIndex() {
  const entries = Route.useLoaderData();
  return (
    <main className="min-h-screen bg-ink text-cream">
      <div className="container-atlas py-16 md:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cream/60 hover:text-emerald transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" /> Back to atlas
        </Link>

        <header className="max-w-3xl mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald mb-4">Weekly digest archive</p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-cream mb-6">
            What Lovable Shipped — every past issue.
          </h1>
          <p className="text-lg text-cream/70 leading-relaxed">
            One email a week. Every new Lovable feature. Nothing else. Every issue we've sent is preserved here as a permanent, indexable page.
          </p>
        </header>

        {/* Above-the-fold notify form — visible on load, no scrolling. */}
        <div className="mb-8 max-w-2xl">
          <NotifyForm />
        </div>

        {entries.length === 0 ? (
          <div className="mt-6">
            <SpecimenIssue />
          </div>
        ) : (
          <ol className="divide-y divide-cream/10 border-t border-b border-cream/10">
            {entries.map((e: ArchiveListItem) => (
              <li key={e.id}>
                <Link
                  to="/digest/$id"
                  params={{ id: e.id }}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-5 py-6 hover:bg-cream/5 transition-colors -mx-4 px-4"
                >
                  <time className="font-mono text-xs uppercase tracking-[0.16em] text-cream/55 tabular-nums">{fmt(e.period_end)}</time>
                  <span className="font-display text-lg md:text-xl text-cream group-hover:text-emerald transition-colors leading-snug">
                    {e.subject.replace(/^What Lovable Shipped · /, "")}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-cream/50 whitespace-nowrap">
                    {e.feature_count} shipped →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
