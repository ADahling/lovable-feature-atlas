import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { features, type Feature } from "../data/features";
import { fmtMonthYearUTC } from "../lib/format-date";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { getFeatureById } from "../lib/features.functions";
import { ShareBar } from "../components/atlas/ShareBar";

const featureBySlug = new Map<string, Feature>(features.map((f) => [f.id, f]));

// Build-time enumeration of per-feature OG images that actually exist on disk.
// Feature slugs missing a PNG fall back to the shared /og-image.png so social
// crawlers never fetch a 404.
const OG_IMAGE_MODULES = import.meta.glob("/public/og/features/*.png", {
  query: "?url",
  import: "default",
  eager: true,
});
const FEATURE_OG_SLUGS = new Set<string>(
  Object.keys(OG_IMAGE_MODULES).map((p) => p.split("/").pop()!.replace(/\.png$/, "")),
);

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

// Valid slugs are lowercase alphanumerics separated by single hyphens.
// Anything else (spaces, symbols, encoded junk, excessive length) is malformed.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 120;

function suggestSlugs(slug: string, limit = 3): Feature[] {
  const needle = slug.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (!needle) return [];
  const scored = features
    .map((f) => {
      const hay = f.id.replace(/-/g, "");
      let score = 0;
      if (hay === needle) score = 100;
      else if (hay.startsWith(needle) || needle.startsWith(hay)) score = 60;
      else if (hay.includes(needle) || needle.includes(hay)) score = 30;
      return { f, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.f);
  return scored;
}

export const Route = createFileRoute("/features/$slug")({
  loader: ({ params }) => {
    const raw = params.slug ?? "";

    // Safe redirect: if the slug only differs by case or a trailing slash,
    // send the client to the canonical lowercase URL.
    const normalized = raw.trim().toLowerCase();
    if (normalized && normalized !== raw && featureBySlug.has(normalized)) {
      throw redirect({
        to: "/features/$slug",
        params: { slug: normalized },
        replace: true,
      });
    }

    // Reject malformed slugs (too long, wrong characters) as not found.
    if (!raw || raw.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(raw)) {
      throw notFound();
    }

    const feature = featureBySlug.get(raw);
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
    const hasPerFeatureImage = FEATURE_OG_SLUGS.has(feature.id);
    const ogImage = hasPerFeatureImage
      ? `${SITE_ORIGIN}/og/features/${feature.id}.png`
      : `${SITE_ORIGIN}/og-image.png`;
    const ogAlt = `${feature.name} — ${feature.tagline}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        ...(hasPerFeatureImage
          ? [
              { property: "og:image:width", content: "1536" },
              { property: "og:image:height", content: "1024" },
            ]
          : []),
        { property: "og:image:alt", content: ogAlt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:image:alt", content: ogAlt },
        ...canonical.meta,
      ],
      links: canonical.links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "@id": url,
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
  const { slug } = Route.useParams();
  const suggestions = suggestSlugs(slug);
  const safeSlug = slug.length > 60 ? slug.slice(0, 60) + "…" : slug;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-5 px-5 py-16 text-center">
      <h1 className="t-title text-cream">Feature not found</h1>
      <p className="t-body text-cream/70">
        We don't have a page for{" "}
        <code className="rounded bg-emerald/10 px-1.5 py-0.5 font-mono text-cream/90">
          /features/{safeSlug}
        </code>
        . It may have been renamed, removed, or mistyped.
      </p>

      {suggestions.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          <p className="t-eyebrow text-emerald">Did you mean</p>
          <ul className="flex flex-col gap-2">
            {suggestions.map((f) => (
              <li key={f.id}>
                <Link
                  to="/features/$slug"
                  params={{ slug: f.id }}
                  className="t-label block rounded-md border border-cream/15 px-3 py-2 text-cream/80 transition-colors hover:border-emerald hover:text-cream"
                >
                  {f.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

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
