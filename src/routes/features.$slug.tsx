import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink, Check, Sparkles } from "lucide-react";
import { features, type Feature } from "../data/features";
import { fmtMonthYearUTC } from "../lib/format-date";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { getFeatureById } from "../lib/features.functions";
import { ShareBar } from "../components/atlas/ShareBar";
import { themeForCategory, withAtlasUtm, LOVABLE_UTM } from "../lib/category-theme";

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

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 120;

function suggestSlugs(slug: string, limit = 3): Feature[] {
  const needle = slug.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (!needle) return [];
  return features
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
}

function relatedFeatures(current: Feature, list: Feature[], limit = 3): Feature[] {
  const sameCat = list.filter((f) => f.category === current.category && f.id !== current.id);
  const currentTime = new Date(current.releaseDate).getTime();
  return sameCat
    .map((f) => ({
      f,
      dist: Math.abs(new Date(f.releaseDate).getTime() - currentTime),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map((x) => x.f);
}

export const Route = createFileRoute("/features/$slug")({
  loader: async ({ params }) => {
    const raw = params.slug ?? "";
    const normalized = raw.trim().toLowerCase();
    if (normalized && normalized !== raw && featureBySlug.has(normalized)) {
      throw redirect({
        to: "/features/$slug",
        params: { slug: normalized },
        replace: true,
      });
    }
    if (!raw || raw.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(raw)) {
      throw notFound();
    }
    const staticHit = featureBySlug.get(raw);
    if (staticHit) return { feature: staticHit };
    try {
      const { feature } = await getFeatureById({ data: { id: raw } });
      if (feature) return { feature };
    } catch (err) {
      console.error("[features.$slug loader] live lookup failed:", err);
    }
    throw notFound();
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
            author: {
              "@type": "Person",
              "@id": "https://lovable-feature-atlas.lovable.app/#curator",
              name: "Alicia Dahling",
              url: "https://www.linkedin.com/in/alicia-dahling",
              sameAs: ["https://www.linkedin.com/in/alicia-dahling"],
              jobTitle: "CFO | Finance Leader | Angel Investor | STEM Advocate",
            },
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
  const theme = themeForCategory(feature.category);
  const related = relatedFeatures(feature, features);
  const sourceHref = withAtlasUtm(feature.source);
  const lovableHref = `https://lovable.dev?${LOVABLE_UTM}`;
  const catSlug = feature.category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-");
  const shareUrl = canonicalUrl(`/features/${feature.id}`);

  return (
    <main className="relative w-full overflow-hidden">
      {/* Banner gradient — extends 640px down and fades into the body via a
          mask so no hard horizontal line ever crashes into the content. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px]"
        style={{
          background: theme.gradient,
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Two-column composition on lg+: main content left, sticky meta rail right */}
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16 lg:pt-20">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-10">
          <Link
            to="/"
            className="t-label inline-flex w-fit items-center gap-2 text-cream/60 transition-colors hover:text-cream"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to the atlas
          </Link>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em]">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1"
                style={{ borderColor: theme.border, color: theme.accent }}
              >
                <span
                  aria-hidden
                  className={"inline-block size-1.5 rounded-full " + statusDotClass[feature.status]}
                />
                <span className={statusTextClass[feature.status]}>{feature.status}</span>
                <span className="text-cream/40">·</span>
                <span>{feature.category}</span>
              </span>
              <span className="text-cream/60">{fmtMonthYearUTC(feature.releaseDate)}</span>
            </div>
            <h1 className="font-display font-semibold leading-[1.06] tracking-[-0.02em] text-cream text-[clamp(2rem,4vw,3.4rem)]">
              {feature.name}
            </h1>
            <p className="t-body-lg max-w-2xl text-cream/85">{feature.tagline}</p>
          </div>

          <p className="t-body max-w-2xl text-cream/85">{feature.description}</p>

          {/* Capabilities + Use cases */}
          {(() => {
            const hasUseCases = Array.isArray(feature.useCases) && feature.useCases.length > 0;
            return (
              <section
                className={
                  "grid gap-10 border-y border-cream/10 py-10 " +
                  (hasUseCases ? "md:grid-cols-2 md:gap-12" : "md:grid-cols-1")
                }
              >
                <div className="flex flex-col gap-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
                    Capabilities
                  </h2>
                  <ul className="flex flex-col gap-4">
                    {feature.capabilities.map((c, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full border"
                          style={{ borderColor: theme.border, color: theme.accent }}
                        >
                          <Check className="size-3" />
                        </span>
                        <span className="t-body text-cream/90">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {hasUseCases && (
                  <div className="flex flex-col gap-5">
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
                      Use cases
                    </h2>
                    <ul className="flex flex-col gap-4">
                      {feature.useCases.map((u, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span
                            aria-hidden
                            className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full border"
                            style={{ borderColor: theme.border, color: theme.accent }}
                          >
                            <Sparkles className="size-3" />
                          </span>
                          <span className="t-body text-cream/90">{u}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            );
          })()}

          {/* Primary outbound CTA */}
          <a
            href={lovableHref}
            target="_blank"
            rel="noopener"
            data-cursor="magnetic"
            className="t-label inline-flex w-fit items-center gap-2 rounded-md border border-gold/50 bg-gold/10 px-4 py-2.5 text-gold transition-colors hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            Start building on Lovable
            <ArrowRight className="size-3.5" aria-hidden />
          </a>

          {/* Related features */}
          {related.length > 0 && (
            <section className="flex flex-col gap-5 border-t border-cream/10 pt-10">
              <div className="flex items-baseline justify-between">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
                  Related in {feature.category}
                </h2>
                <Link
                  to="/categories/$slug"
                  params={{ slug: catSlug }}
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-cream/50 hover:text-cream"
                >
                  See all →
                </Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to="/features/$slug"
                      params={{ slug: r.id }}
                      className="group flex h-full flex-col gap-2 rounded-lg border border-cream/10 bg-cream/[0.02] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald/40 hover:bg-emerald/[0.04]"
                    >
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/50">
                        <span
                          aria-hidden
                          className={"inline-block size-1.5 rounded-full " + statusDotClass[r.status]}
                        />
                        <span>{fmtMonthYearUTC(r.releaseDate)}</span>
                      </div>
                      <div className="t-card text-cream group-hover:text-emerald">{r.name}</div>
                      <p className="line-clamp-2 text-sm text-cream/60">{r.tagline}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sticky meta rail — desktop only */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 flex flex-col gap-6 rounded-xl border border-cream/10 bg-cream/[0.02] p-5 backdrop-blur">
            <MetaRow label="Status">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className={"inline-block size-1.5 rounded-full " + statusDotClass[feature.status]}
                />
                <span className={"font-mono text-xs " + statusTextClass[feature.status]}>
                  {feature.status}
                </span>
              </span>
            </MetaRow>
            <MetaRow label="Released">
              <span className="font-mono text-xs text-cream/85">
                {fmtMonthYearUTC(feature.releaseDate)}
              </span>
            </MetaRow>
            <MetaRow label="Category">
              <Link
                to="/categories/$slug"
                params={{ slug: catSlug }}
                className="font-mono text-xs transition-colors hover:text-cream"
                style={{ color: theme.accent }}
              >
                {feature.category} →
              </Link>
            </MetaRow>
            <MetaRow label="Pricing">
              <span className="font-mono text-xs text-cream/85">{feature.pricing}</span>
            </MetaRow>

            <div className="mt-1 flex flex-col gap-2 border-t border-cream/10 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40">
                Source
              </p>
              <a
                href={sourceHref}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-emerald transition-colors hover:bg-emerald/20"
              >
                docs.lovable.dev
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </div>

            <div className="flex flex-col gap-2 border-t border-cream/10 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40">
                Share
              </p>
              <ShareBar
                url={shareUrl}
                title={feature.name}
                hook={feature.tagline}
                variant="slim"
                feature={feature}
              />
              <Link
                to="/quiz"
                className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/50 transition-colors hover:text-gold"
              >
                Used this? Take the quiz →
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile / tablet meta block — appears in flow after the primary CTA */}
        <div className="flex flex-col gap-3 rounded-xl border border-cream/10 bg-cream/[0.02] p-5 lg:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <span className="t-label rounded border border-emerald/30 px-2 py-1 text-cream/70">
              {feature.pricing}
            </span>
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener"
              className="t-label inline-flex items-center gap-2 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-2 text-emerald transition-colors hover:bg-emerald/20"
            >
              View on docs.lovable.dev
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
          <ShareBar url={shareUrl} title={feature.name} hook={feature.tagline} feature={feature} />
        </div>
      </div>
    </main>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40">
        {label}
      </span>
      {children}
    </div>
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
