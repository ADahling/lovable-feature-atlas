import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { features, type Feature } from "../data/features";
import { fmtMonthYearUTC } from "../lib/format-date";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";

const featureBySlug = new Map<string, Feature>(features.map((f) => [f.id, f]));

const statusDotClass: Record<Feature["status"], string> = {
  GA: "bg-emerald",
  Beta: "bg-gold",
  Removed: "bg-cream/40",
};
const statusTextClass: Record<Feature["status"], string> = {
  GA: "text-emerald",
  Beta: "text-gold",
  Removed: "text-cream/55",
};

export const Route = createFileRoute("/features/$slug")({
  loader: ({ params }) => {
    const feature = featureBySlug.get(params.slug);
    if (!feature) throw notFound();
    return { feature };
  },
  head: ({ params, loaderData }) => {
    const path = `/features/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [
          { title: "Feature not found — The Lovable Feature Atlas" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { feature } = loaderData;
    const title = `${feature.name} — Lovable Feature Atlas`;
    const description = feature.tagline;
    const canonical = buildCanonicalTags({ path });
    const url = canonicalUrl(path);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:image", content: `${SITE_ORIGIN}/og-image.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: `${SITE_ORIGIN}/og-image.png` },
        ...canonical.meta,
      ],
      links: canonical.links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: feature.name,
            description: feature.description,
            datePublished: feature.releaseDate,
            about: { "@type": "SoftwareApplication", name: "Lovable" },
            author: { "@type": "Person", name: "Alicia Dahling" },
            url,
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: FeatureDetailPage,
  notFoundComponent: FeatureNotFound,
});

function FeatureDetailPage() {
  const { feature } = Route.useLoaderData() as { feature: Feature };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-5 py-16 sm:px-8 sm:py-24">
      <div>
        <Link
          to="/"
          className="t-label inline-flex items-center gap-2 text-cream/60 transition-colors hover:text-emerald"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to the atlas
        </Link>
      </div>

      <header className="flex flex-col gap-5">
        <div className="t-label flex flex-wrap items-center text-cream/55">
          <span
            aria-hidden
            className={"inline-block size-1.5 rounded-full mr-3 " + statusDotClass[feature.status]}
          />
          <span className={statusTextClass[feature.status]}>{feature.status}</span>
          <span className="mx-3 text-cream/30">/</span>
          <span className="text-cream/70">{feature.category}</span>
          <span className="mx-3 text-cream/30">/</span>
          <span className="font-mono text-cream/70">{fmtMonthYearUTC(feature.releaseDate)}</span>
        </div>
        <h1 className="t-title text-cream">{feature.name}</h1>
        <p className="t-body-lg text-cream/85">{feature.tagline}</p>
        <div className="h-px w-full bg-emerald/20" />
        <p className="t-body text-cream/80">{feature.description}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="t-eyebrow text-emerald">Capabilities</h2>
        <ul className="flex flex-col gap-2">
          {feature.capabilities.map((c, i) => (
            <li key={i} className="flex items-start gap-3">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald" />
              <span className="t-body text-cream">{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="t-eyebrow text-emerald">Use cases</h2>
        <ul className="flex flex-col gap-2">
          {feature.useCases.map((u, i) => (
            <li key={i} className="flex items-start gap-3">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald" />
              <span className="t-body text-cream">{u}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-emerald/20 pt-6">
        <span className="t-label rounded border border-emerald/30 px-2 py-1 text-cream/70">
          {feature.pricing}
        </span>
        <a
          href={feature.source}
          target="_blank"
          rel="noopener"
          className="t-label inline-flex items-center gap-2 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-2 text-emerald transition-colors hover:bg-emerald/20"
        >
          View on docs.lovable.dev
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
    </main>
  );
}

function FeatureNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="t-title text-cream">Feature not found</h1>
      <p className="t-body text-cream/70">
        We don't have a page for that feature slug. It may have been renamed or removed.
      </p>
      <Link
        to="/"
        className="t-label inline-flex items-center gap-2 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-2 text-emerald transition-colors hover:bg-emerald/20"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to the atlas
      </Link>
    </main>
  );
}
