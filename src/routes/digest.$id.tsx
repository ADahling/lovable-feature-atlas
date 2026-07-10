import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPublishedDigest, type ArchiveFeature } from "../lib/digest-archive.functions";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";

function fmtDay(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  } catch { return iso; }
}
function fmtShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  } catch { return iso; }
}

export const Route = createFileRoute("/digest/$id")({
  loader: async ({ params }) => {
    const digest = await getPublishedDigest({ data: { id: params.id } });
    if (!digest) throw notFound();
    return digest;
  },
  head: ({ params, loaderData }) => {
    const path = `/digest/${params.id}`;
    const canonical = buildCanonicalTags({ path });
    const image = `${SITE_ORIGIN}/og-image.png`;
    const weekLabel = loaderData ? fmtDay(loaderData.period_end) : "";
    const title = loaderData
      ? `${loaderData.subject} — atlas.dahlingdigital.com`
      : "Weekly digest — What Lovable Shipped";
    const description = loaderData
      ? `The What Lovable Shipped digest for the week ending ${weekLabel}. ${loaderData.feature_count} new features from Lovable this week.`
      : "A past issue of the What Lovable Shipped weekly digest.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...canonical.meta,
      ],
      links: canonical.links,
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: loaderData.subject,
                datePublished: loaderData.sent_at,
                dateModified: loaderData.sent_at,
                url: canonicalUrl(path),
                author: {
                  "@type": "Person",
                  name: "Alicia Dahling",
                  url: "https://dahlingdigital.com",
                },
                publisher: {
                  "@type": "Organization",
                  name: "The Lovable Feature Atlas",
                  url: SITE_ORIGIN,
                },
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <main className="min-h-screen bg-ink text-cream flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream/50 mb-3">404</p>
        <h1 className="font-display text-2xl mb-4">Digest issue not found.</h1>
        <Link to="/digest" className="text-forest underline underline-offset-4">Browse the archive →</Link>
      </div>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-ink text-cream flex items-center justify-center">
      <div className="text-center max-w-md">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream/50 mb-3">Error</p>
        <p className="text-cream/70 mb-4">{error.message}</p>
        <Link to="/digest" className="text-forest underline underline-offset-4">Back to archive →</Link>
      </div>
    </main>
  ),
  component: DigestDetailPage,
});

function DigestDetailPage() {
  const d = Route.useLoaderData();
  const weekLabel = fmtDay(d.period_end);

  return (
    <main className="min-h-screen bg-ink text-cream">
      <article className="container-atlas py-16 md:py-24 max-w-4xl">
        <Link
          to="/digest"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cream/60 hover:text-emerald transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" /> Archive
        </Link>

        <header className="mb-12 pb-10 border-b border-cream/10">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald mb-4">
            Week ending {weekLabel}
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-cream mb-4">
            {d.subject}
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-cream/50 tabular-nums">
            Sent {fmtShort(d.sent_at)} · {d.feature_count} shipped · {d.catalogued_total} newly catalogued
          </p>
        </header>

        {d.shipped.length === 0 ? (
          <section className="mb-16">
            <p className="text-lg text-cream/70 leading-relaxed">
              Quiet week on the changelog — no new features shipped on Lovable. The catalog is still tracking every release. See you next Monday.
            </p>
          </section>
        ) : (
          <section className="mb-16">
            <h2 className="font-display text-2xl md:text-3xl text-cream mb-3">
              {d.shipped.length} new {d.shipped.length === 1 ? "feature" : "features"} shipped on Lovable this week.
            </h2>
            <div className="mt-8 divide-y divide-cream/10 border-t border-b border-cream/10">
              {d.shipped.map((f: ArchiveFeature) => (
                <div key={f.id} className="py-8">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/55">{f.category}</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full border font-mono text-[10px] uppercase tracking-[0.14em] ${
                        f.status === "GA"
                          ? "border-gold/60 text-gold-dark"
                          : f.status === "Beta"
                            ? "border-emerald/60 text-emerald"
                            : "border-cream/30 text-cream/60"
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl text-cream mb-2 leading-snug">
                    <Link to="/features/$slug" params={{ slug: f.id }} className="hover:text-emerald transition-colors">
                      {f.name}
                    </Link>
                  </h3>
                  <p className="text-cream/70 leading-relaxed">{f.tagline}</p>
                  <Link
                    to="/features/$slug"
                    params={{ slug: f.id }}
                    className="mt-3 inline-flex items-center gap-1.5 text-emerald text-sm hover:gap-2.5 transition-all"
                  >
                    Read on the atlas <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {d.catalogued.length > 0 && (
          <section className="mb-16 pt-10 border-t border-cream/15">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55 mb-2">
              Also newly catalogued in the atlas
            </p>
            <p className="text-sm text-cream/60 leading-relaxed mb-6 max-w-2xl">
              Older Lovable features we just added coverage for — not new launches, but new to the atlas.
            </p>
            <ul className="divide-y divide-cream/10 border-t border-b border-cream/10">
              {d.catalogued.map((f: ArchiveFeature) => (
                <li key={f.id} className="py-3 flex items-baseline justify-between gap-4">
                  <Link
                    to="/features/$slug"
                    params={{ slug: f.id }}
                    className="text-cream hover:text-emerald transition-colors font-medium"
                  >
                    {f.name}
                  </Link>
                  <span className="font-mono text-[11px] text-cream/50 whitespace-nowrap">
                    {fmtShort(f.release_date)}
                  </span>
                </li>
              ))}
            </ul>
            {d.catalogued_total > d.catalogued.length && (
              <p className="mt-4 text-sm">
                <Link to="/" className="text-emerald hover:underline underline-offset-4">
                  +{d.catalogued_total - d.catalogued.length} more in the atlas →
                </Link>
              </p>
            )}
          </section>
        )}

        <footer className="mt-16 pt-8 border-t border-cream/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link to="/digest" className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/60 hover:text-emerald">
            ← All past issues
          </Link>
          <Link to="/" className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/60 hover:text-emerald">
            Browse the catalog →
          </Link>
        </footer>
      </article>
    </main>
  );
}
