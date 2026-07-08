import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { type Feature } from "../data/features";
import { fmtMonthYearUTC } from "../lib/format-date";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { categoryFromSlug, categorySlug, featuresInCategory } from "../lib/categories";
import { ShareBar } from "../components/atlas/ShareBar";

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

interface LoaderData {
  category: string;
  features: Feature[];
}

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }): LoaderData => {
    const category = categoryFromSlug(params.slug);
    if (!category) throw notFound();
    return { category, features: featuresInCategory(category) };
  },
  head: ({ params, loaderData }) => {
    const path = `/categories/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [
          { title: "Category not found — The Lovable Feature Atlas" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { category, features } = loaderData;
    const count = features.length;
    const title = `${category} — Lovable Features · The Lovable Feature Atlas`;
    const description = `Every Lovable feature in the ${category} category. ${count} ${
      count === 1 ? "feature" : "features"
    } catalogued across GA, Beta, and Removed releases.`;
    const canonical = buildCanonicalTags({ path });
    const url = canonicalUrl(path);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
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
            "@type": "CollectionPage",
            name: `${category} — Lovable Features`,
            description,
            url,
            isPartOf: {
              "@type": "WebSite",
              name: "The Lovable Feature Atlas",
              url: SITE_ORIGIN,
            },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: count,
              itemListElement: features.map((f, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE_ORIGIN}/features/${f.id}`,
                name: f.name,
              })),
            },
          }),
        },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: CategoryNotFound,
});

function CategoryPage() {
  const { category, features } = Route.useLoaderData() as LoaderData;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-5 py-16 sm:px-8 sm:py-24">
      <div>
        <Link
          to="/"
          className="t-label inline-flex items-center gap-2 text-cream/60 transition-colors hover:text-emerald"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to the atlas
        </Link>
      </div>

      <header className="flex flex-col gap-4">
        <p className="t-eyebrow text-emerald">Category</p>
        <h1 className="t-title text-cream">{category}</h1>
        <p className="t-body text-cream/70">
          {features.length} {features.length === 1 ? "feature" : "features"} in the {category}{" "}
          category.
        </p>
        <div className="h-px w-full bg-emerald/20" />
      </header>

      <ul className="flex flex-col divide-y divide-cream/10">
        {features.map((f) => (
          <li key={f.id}>
            <Link
              to="/features/$slug"
              params={{ slug: f.id }}
              className="group flex flex-col gap-2 py-5 transition-colors hover:bg-emerald/5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <div className="flex flex-col gap-1">
                <div className="t-label flex items-center text-cream/55">
                  <span
                    aria-hidden
                    className={"inline-block size-1.5 rounded-full mr-3 " + statusDotClass[f.status]}
                  />
                  <span className={statusTextClass[f.status]}>{f.status}</span>
                  <span className="mx-3 text-cream/30">/</span>
                  <span className="font-mono text-cream/70">{fmtMonthYearUTC(f.releaseDate)}</span>
                </div>
                <h2 className="t-card text-cream transition-colors group-hover:text-emerald">
                  {f.name}
                </h2>
                <p className="t-body-sm text-cream/70">{f.tagline}</p>
              </div>
              <span aria-hidden className="t-meta text-cream/50 transition-colors group-hover:text-emerald">
                View →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function CategoryNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="t-title text-cream">Category not found</h1>
      <p className="t-body text-cream/70">
        We don't have a page for that category. It may have been renamed.
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
