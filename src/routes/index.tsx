import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Grid3x3, LayoutList } from "lucide-react";
import { Hero } from "../components/atlas/Hero";
import { FilterBar, type SortMode, type StatusKey } from "../components/atlas/FilterBar";
import { FeatureGrid } from "../components/atlas/FeatureGrid";
import { TimelineView } from "../components/atlas/TimelineView";
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
      { title: "The Lovable Feature Atlas — Complete Release Catalog" },
      {
        name: "description",
        content:
          "The independent, fan-built catalog of every Lovable feature, beta, and release — filter, search, and explore the full changelog, updated daily.",
      },
      {
        property: "og:title",
        content: "The Lovable Feature Atlas — Complete Release Catalog",
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
        content: "The Lovable Feature Atlas — Complete Release Catalog",
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

  // Filter / sort / query changes while scrolled deep can strand the viewport
  // in empty space above the footer — especially because browser scroll
  // anchoring can snap us to y=0 as filtered rows leave the DOM. Always
  // smooth-scroll the results grid into view on any control change (skipping
  // the initial mount so first load doesn't jump).
  const filterMountRef = useRef(true);
  useEffect(() => {
    console.log("SCROLL_FIX effect", { mount: filterMountRef.current });
    if (filterMountRef.current) {
      filterMountRef.current = false;
      return;
    }
    if (typeof document === "undefined") return;
    const el = document.getElementById("features");
    if (!el) return;
    // Defer to the next frame so layout (including any scroll-anchoring
    // adjustment from the filtered DOM) has settled before we read geometry.
    // Double-rAF + timeout so browser scroll anchoring finishes its own
    // adjustment first; otherwise it clobbers our scrollTo.
    let cancelled = false;
    const run = (tag: string) => {
      if (cancelled) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      const target = Math.max(0, top);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // eslint-disable-next-line no-console
      console.log("SCROLL_FIX", tag, { scrollY: window.scrollY, top, target, reduced });
      window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
    };
    const r1 = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        run("raf");
        window.setTimeout(() => run("settle"), 180);
      }),
    );
    return () => {
      cancelled = true;
      cancelAnimationFrame(r1);
    };
  }, [selectedCategories, selectedStatuses, sortMode, query]);


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
        {/* Editorial intro to the catalog — sets the reading mode for
            the filter bar and grid that follow. Kept short on purpose so
            the grid feels curated, not dense. */}
        <section
          className="container-atlas pt-20 pb-6 lg:pt-28 lg:pb-8"
          aria-labelledby="catalog-intro"
        >
          <div className="max-w-3xl">
            <p className="t-eyebrow text-emerald">The catalog</p>
            <h2
              id="catalog-intro"
              className="t-title mt-3 text-cream"
            >
              Every feature, filed and dated.
            </h2>
            <p className="t-body mt-4 text-cream/70">
              Filter by category, status, or search. Each entry links to the primary source
              on <span className="whitespace-nowrap">docs.lovable.dev</span> so nothing here
              second-guesses the official record.
            </p>
          </div>
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
        <div id="features" className="container-atlas pb-24 pt-8 lg:pb-32 lg:pt-10 scroll-mt-24">
          {/* Grid/Timeline toggle — desktop only. */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p
              className="t-meta text-cream/50"
              aria-live="polite"
              aria-atomic="true"
            >
              Showing {filteredFeatures.length} of {features.length} features
            </p>
            <div className="hidden md:block">
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
          </div>
          {viewMode === "grid" ? (
            <FeatureGrid features={filteredFeatures} onSelect={openFeature} />
          ) : (
            <TimelineView features={filteredFeatures} onSelect={openFeature} />
          )}
        </div>

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
