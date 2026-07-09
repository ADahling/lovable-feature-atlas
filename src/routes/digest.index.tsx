import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { listPublishedDigests, type ArchiveListItem } from "../lib/digest-archive.functions";
import { buildCanonicalTags, SITE_ORIGIN } from "../lib/canonical-meta";

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

function DigestArchiveIndex() {
  const entries = Route.useLoaderData();
  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="container-atlas py-16 md:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60 hover:text-forest transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" /> Back to atlas
        </Link>

        <header className="max-w-3xl mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald mb-4">Weekly digest archive</p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-ink mb-6">
            What Lovable Shipped — every past issue.
          </h1>
          <p className="text-lg text-ink/70 leading-relaxed">
            One email a week. Every new Lovable feature. Nothing else. Every issue we've sent is preserved here as a permanent, indexable page.
          </p>
        </header>

        {entries.length === 0 ? (
          <div className="rounded-lg border border-ink/10 bg-white/60 px-6 py-10 text-center">
            <p className="text-ink/60">The first issue lands soon. Subscribe from the footer to get it in your inbox.</p>
          </div>
        ) : (
          <ol className="divide-y divide-ink/10 border-t border-b border-ink/10">
            {entries.map((e: ArchiveListItem) => (
              <li key={e.id}>
                <Link
                  to="/digest/$id"
                  params={{ id: e.id }}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-5 py-6 hover:bg-white/50 transition-colors -mx-4 px-4"
                >
                  <time className="font-mono text-xs uppercase tracking-[0.16em] text-ink/55 tabular-nums">{fmt(e.period_end)}</time>
                  <span className="font-display text-lg md:text-xl text-ink group-hover:text-forest transition-colors leading-snug">
                    {e.subject.replace(/^What Lovable Shipped · /, "")}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50 whitespace-nowrap">
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
