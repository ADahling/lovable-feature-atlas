import { useCallback, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Grid3x3, LayoutList } from "lucide-react";
import { Hero } from "../components/atlas/Hero";
import { FilterBar, type SortMode, type StatusKey } from "../components/atlas/FilterBar";
import { FeatureGrid } from "../components/atlas/FeatureGrid";
import { TimelineView } from "../components/atlas/TimelineView";
import { GscStatusPanel } from "../components/atlas/GscStatusPanel";
import { IndexingProgressWidget } from "../components/atlas/IndexingProgressWidget";
import { SitemapIssuesTable } from "../components/atlas/SitemapIssuesTable";
import { SeoScanHistory } from "../components/atlas/SeoScanHistory";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { features as featuresData, type Feature } from "../data/features";
import { useFeatures } from "../hooks/use-features";
import { buildCanonicalTags } from "../lib/canonical-meta";
import { allCategoryNames, categorySlug } from "../lib/categories";

const homeCanonical = buildCanonicalTags({ path: "/" });

type ViewMode = "grid" | "timeline";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "The Lovable Feature Atlas — Every Lovable Feature, Every Release" },
      {
        name: "description",
        content:
          "An independent, fan-built catalog of every Lovable feature, beta, and release through 2026. Filter, search, and explore 330 features across 18 categories.",
      },
      {
        property: "og:title",
        content: "The Lovable Feature Atlas — Every Lovable Feature, Every Release",
      },
      {
        property: "og:description",
        content:
          "Independent, fan-built catalog of every Lovable feature, beta, and release through May 2026. By Alicia Dahling — not affiliated with Lovable AB.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://lovable-feature-atlas.lovable.app/og-image.png" },
      { property: "og:image:width", content: "1536" },
      { property: "og:image:height", content: "1024" },
      {
        property: "og:image:alt",
        content:
          "The Lovable Feature Atlas — cream serif wordmark on a deep forest-green background with a glossy emerald-and-gold heart mark. Subtitle: Community Catalog · Every Feature · 2024–2026. Credit: by Alicia Dahling, Dahling Digital. Not affiliated with Lovable AB.",
      },
      {
        name: "twitter:title",
        content: "The Lovable Feature Atlas — Every Lovable Feature, Every Release",
      },
      {
        name: "twitter:description",
        content:
          "Independent, fan-built catalog of every Lovable feature, beta, and release through May 2026. By Alicia Dahling — not affiliated with Lovable AB.",
      },
      { name: "twitter:image", content: "https://lovable-feature-atlas.lovable.app/og-image.png" },
      {
        name: "twitter:image:alt",
        content:
          "The Lovable Feature Atlas — cream serif wordmark on a deep forest-green background with a glossy emerald-and-gold heart mark. Subtitle: Community Catalog · Every Feature · 2024–2026.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      // canonical / og:url / twitter:url — generated via buildCanonicalTags
      ...homeCanonical.meta,
    ],
    links: homeCanonical.links,
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": "https://lovable-feature-atlas.lovable.app/#collection",
              name: "The Lovable Feature Atlas",
              description:
                "Independent, fan-built catalog of every Lovable feature, beta, and release through May 2026.",
              url: "https://lovable-feature-atlas.lovable.app/",
              isAccessibleForFree: true,
              inLanguage: "en",
              author: {
                "@type": "Person",
                name: "Alicia Dahling",
                url: "https://dahlingdigital.com",
              },
              publisher: {
                "@type": "Organization",
                name: "Dahling Digital",
                url: "https://dahlingdigital.com",
              },
              about: {
                "@type": "SoftwareApplication",
                name: "Lovable",
                url: "https://lovable.dev",
                applicationCategory: "DeveloperApplication",
              },
              mainEntity: {
                "@type": "ItemList",
                name: "Lovable features, betas, and releases",
                numberOfItems: featuresData.length,
                itemListOrder: "https://schema.org/ItemListOrderDescending",
                itemListElement: featuresData.slice(0, 25).map((f, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: `https://lovable-feature-atlas.lovable.app/#feature-${f.id}`,
                  item: {
                    "@type": "SoftwareApplication",
                    name: f.name,
                    description: f.tagline,
                    applicationCategory: f.category,
                    datePublished: f.releaseDate,
                    offers: {
                      "@type": "Offer",
                      category: f.pricing,
                    },
                    isPartOf: {
                      "@type": "SoftwareApplication",
                      name: "Lovable",
                      url: "https://lovable.dev",
                    },
                  },
                })),
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://lovable-feature-atlas.lovable.app/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Features",
                  item: "https://lovable-feature-atlas.lovable.app/#features",
                },
              ],
            },
            {
              "@type": "WebSite",
              "@id": "https://lovable-feature-atlas.lovable.app/#website",
              url: "https://lovable-feature-atlas.lovable.app",
              name: "The Lovable Feature Atlas",
              alternateName: "Lovable Feature Atlas",
              inLanguage: "en",
              publisher: {
                "@type": "Organization",
                name: "Dahling Digital",
                url: "https://dahlingdigital.com",
              },
              author: {
                "@type": "Person",
                name: "Alicia Dahling",
                url: "https://dahlingdigital.com",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://lovable-feature-atlas.lovable.app/?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
});

function Index() {
  const { features } = useFeatures();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<StatusKey>>(
    new Set(["GA", "Beta", "Removed"]),
  );
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const navigate = useNavigate();
  const openFeature = useCallback(
    (f: Feature) => {
      void navigate({ to: "/features/$slug", params: { slug: f.id } });
    },
    [navigate],
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filteredFeatures = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = features.filter((f) => {
      if (!selectedStatuses.has(f.status)) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(f.category)) return false;
      if (!q) return true;
      const blob = (
        f.name +
        " " +
        f.tagline +
        " " +
        f.description +
        " " +
        f.capabilities.join(" ")
      ).toLowerCase();
      return blob.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sortMode === "newest") return b.releaseDate.localeCompare(a.releaseDate);
      if (sortMode === "oldest") return a.releaseDate.localeCompare(b.releaseDate);
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [features, selectedCategories, selectedStatuses, sortMode, query]);

  const latestFeature = useMemo(() => {
    if (features.length === 0) return null;
    return [...features].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))[0];
  }, [features]);

  const latestDate = useMemo(() => {
    if (!latestFeature) return "";
    try {
      return new Date(latestFeature.releaseDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return latestFeature.releaseDate;
    }
  }, [latestFeature]);

  return (
    <>
      <main className="relative bg-ink text-cream">
        <Hero />

        {latestFeature && (
          <section className="container-atlas pt-6 lg:pt-8" aria-label="Latest release">
            <Link
              to="/features/$slug"
              params={{ slug: latestFeature.id }}
              className="group flex flex-col items-start gap-3 rounded-xl border border-cream/10 bg-ink/60 px-5 py-4 transition-colors hover:border-gold/50 hover:bg-ink sm:flex-row sm:items-center sm:gap-5"
            >
              <span className="inline-flex shrink-0 items-center rounded-sm border border-gold/50 bg-gold/10 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-gold">
                Latest
              </span>
              <p className="t-body-sm min-w-0 flex-1 truncate text-cream/80">
                <span className="font-medium text-cream">{latestFeature.name}</span>
                <span className="text-cream/55"> — {latestFeature.tagline}</span>
              </p>
              <div className="flex shrink-0 items-center gap-4">
                <time
                  dateTime={latestFeature.releaseDate}
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/50"
                >
                  {latestDate}
                </time>
                <span className="t-meta text-emerald transition-colors group-hover:text-emerald-glow">
                  Read →
                </span>
              </div>
            </Link>
          </section>
        )}
        <section className="container-atlas pt-12 lg:pt-16">
          <div className="flex items-baseline justify-between gap-6 border-b border-cream/15 pb-4">
            <div>
              <p className="t-eyebrow text-emerald">SEO &amp; AEO essentials</p>
              <h2 className="t-card mt-1 text-cream">Ship search-ready for Google and AI answer engines</h2>
            </div>
            <p className="t-meta hidden text-cream/50 sm:block">3 features</p>
          </div>
          <p className="t-body-sm mt-4 max-w-3xl text-cream/70">
            Three Lovable releases work together so projects surface in Google and AI answer engines like ChatGPT and Perplexity. Here's what each one does, pulled from the official docs.
          </p>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-xl border border-emerald/25 bg-emerald/15 md:grid-cols-3">
            {["discoverable-by-default", "chat-with-seo-data", "seo-review-dashboard"].map((id, i) => {
              const f =
                features.find((x) => x.id === id) ??
                featuresData.find((x) => x.id === id);
              if (!f) return null;
              return (
                <li key={id} className="bg-ink">
                  <button
                    type="button"
                    onClick={() => openFeature(f)}
                    className="group flex h-full w-full flex-col gap-4 p-6 text-left transition-colors hover:bg-emerald/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium tracking-[0.18em] text-emerald">
                        STEP 0{i + 1}
                      </span>
                      <span className="t-meta text-cream/70">{f.category}</span>
                    </div>
                    <span className="t-card text-cream">{f.name}</span>
                    <span className="t-body-sm text-cream/75">{f.tagline}</span>
                    <div className="mt-auto flex items-center justify-between border-t border-cream/10 pt-3">
                      <span className="t-meta text-cream/55">{f.pricing}</span>
                      <span className="t-meta text-emerald group-hover:text-emerald-glow">Read more →</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
        <FilterBar
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          selectedStatuses={selectedStatuses}
          onStatusesChange={setSelectedStatuses}
          sortMode={sortMode}
          onSortChange={setSortMode}
          query={query}
          onQueryChange={setQuery}
        />
        <div id="features" className="container-atlas section-y scroll-mt-24">
          {/* Grid/Timeline toggle — desktop only. On mobile the timeline
              variant is too cramped to be useful, and rendering an empty
              wrapper leaves an orphaned styled container between the search
              field and the "Showing" counter. */}
          <div className="mb-4 hidden justify-end md:flex">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => {
                if (v === "grid" || v === "timeline") setViewMode(v);
              }}
            >
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="t-label gap-2 text-cream/70 data-[state=on]:bg-emerald/20 data-[state=on]:text-cream"
              >
                <Grid3x3 className="size-3.5" aria-hidden />
                Grid
              </ToggleGroupItem>
              <ToggleGroupItem
                value="timeline"
                aria-label="Timeline view"
                className="t-label gap-2 text-cream/70 data-[state=on]:bg-emerald/20 data-[state=on]:text-cream"
              >
                <LayoutList className="size-3.5" aria-hidden />
                Timeline
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <p className="t-meta mb-12 text-cream/50" aria-live="polite" aria-atomic="true">
            Showing {filteredFeatures.length} of {features.length} features
          </p>
          {viewMode === "grid" ? (
            <FeatureGrid features={filteredFeatures} onSelect={openFeature} />
          ) : (
            <TimelineView features={filteredFeatures} onSelect={openFeature} />
          )}
        </div>
        <IndexingProgressWidget />
        <GscStatusPanel />
        <SitemapIssuesTable />
        <SeoScanHistory />
        {/* Crawlable sitemap of every feature and category page. Visually hidden
            but fully accessible to screen readers and search engines. */}
        <nav aria-label="All feature pages" className="sr-only">
          <h2>All Lovable features</h2>
          <ul>
            {featuresData.map((f) => (
              <li key={f.id}>
                <a href={`/features/${f.id}`}>{f.name}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="All category pages" className="sr-only">
          <h2>Browse by category</h2>
          <ul>
            {allCategoryNames().map((name) => (
              <li key={name}>
                <a href={`/categories/${categorySlug(name)}`}>{name}</a>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </>
  );
}
