import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Hero } from "../components/atlas/Hero";
import { FilterBar, type SortMode, type StatusKey, type ViewMode } from "../components/atlas/FilterBar";
import { FeatureGrid } from "../components/atlas/FeatureGrid";
import { TimelineView } from "../components/atlas/TimelineView";
import type { FeatureCard as Feature } from "../lib/features.functions";
import { useFeatures } from "../hooks/use-features";
import { buildCanonicalTags } from "../lib/canonical-meta";
import { allCategoryNames, categorySlug } from "../lib/categories";

const homeCanonical = buildCanonicalTags({ path: "/" });

export const Route = createFileRoute("/")({
  component: Index,
  loader: async () => {
    // Edge-cache the homepage HTML. Features refresh at most once per day
    // via the noon cron, so serve fresh for an hour and stale for a day.
    const { markCacheable } = await import("../lib/features.functions");
    await markCacheable();
    return null;
  },
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
      { property: "og:image", content: "https://atlas.dahlingdigital.com/og-image.png" },
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
      { name: "twitter:image", content: "https://atlas.dahlingdigital.com/og-image.png" },
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
              "@id": "https://atlas.dahlingdigital.com/#collection",
              name: "The Lovable Feature Atlas",
              description:
                "Independent, fan-built catalog of every Lovable feature, beta, and release through May 2026.",
              url: "https://atlas.dahlingdigital.com/",
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
                itemListOrder: "https://schema.org/ItemListOrderDescending",
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://atlas.dahlingdigital.com/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Features",
                  item: "https://atlas.dahlingdigital.com/#features",
                },
              ],
            },
            {
              "@type": "WebSite",
              "@id": "https://atlas.dahlingdigital.com/#website",
              url: "https://atlas.dahlingdigital.com",
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
                    "https://atlas.dahlingdigital.com/?q={search_term_string}",
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

  // Preserve scroll position when switching between Grid / Timeline views.
  // Without this, the taller/shorter layout shift can drop the viewport.
  const onViewModeChange = useCallback((next: ViewMode) => {
    if (typeof window === "undefined") {
      setViewMode(next);
      return;
    }
    const y = window.scrollY;
    setViewMode(next);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo({ top: y }));
    });
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Filter / sort changes while scrolled deep can strand the viewport
  // in empty space above the footer — especially because browser scroll
  // anchoring can snap us to y=0 as filtered rows leave the DOM. Smooth-scroll
  // the results grid into view when categories, statuses, or sort change.
  // Deliberately excludes `query`: typing in search fires on every keystroke,
  // and re-scrolling per character yanks the page and interrupts the previous
  // smooth scroll. Search narrows in place.
  const filterMountRef = useRef(true);
  useEffect(() => {
    if (filterMountRef.current) {
      filterMountRef.current = false;
      return;
    }
    if (typeof document === "undefined") return;
    const el = document.getElementById("features");
    if (!el) return;
    // Double-rAF + re-assert so browser scroll anchoring (which can snap
    // scrollY to 0 as filtered rows leave the DOM) can't clobber our target.
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
    };
    const r1 = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        run();
        window.setTimeout(run, 180);
      }),
    );
    return () => {
      cancelled = true;
      cancelAnimationFrame(r1);
    };
  }, [selectedCategories, selectedStatuses, sortMode]);


  const filteredFeatures = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = features.filter((f) => {
      if (!selectedStatuses.has(f.status)) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(f.category)) return false;
      if (!q) return true;
      // Homepage search is card-scoped: name + tagline + category. Deeper
      // matches (description, capabilities) live on the /features/$slug
      // detail pages and in `/llms.txt`.
      const blob = (f.name + " " + f.tagline + " " + f.category).toLowerCase();
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
            <a
              href={`/features/${latestFeature.id}`}
              className="group flex flex-col items-start gap-2.5 rounded-lg border border-cream/[0.06] bg-transparent px-4 py-2.5 transition-colors hover:border-gold/30 hover:bg-ink/40 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="inline-flex shrink-0 items-center rounded-sm border border-gold/30 bg-transparent px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-gold/80">
                Latest
              </span>
              <p className="t-body-sm min-w-0 flex-1 truncate text-cream/60">
                <span className="font-medium text-cream/85">{latestFeature.name}</span>
                <span className="text-cream/45"> — {latestFeature.tagline}</span>
              </p>
              <div className="flex shrink-0 items-center gap-4">
                <time
                  dateTime={latestFeature.releaseDate}
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/40"
                >
                  {latestDate}
                </time>
                <span className="t-meta text-emerald/70 transition-colors group-hover:text-emerald-glow">
                  Read →
                </span>
              </div>
            </a>
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
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          totalCount={features.length}
        />
        <div id="features" className="container-atlas pb-24 pt-8 lg:pb-32 lg:pt-10 scroll-mt-24" style={{ overflowAnchor: "none" }}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div
              className="t-meta text-cream/50"
              aria-live="polite"
              aria-atomic="true"
            >
              Showing{" "}
              <span className="relative inline-block align-baseline tabular-nums text-cream/85">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={filteredFeatures.length}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block"
                  >
                    {filteredFeatures.length}
                  </motion.span>
                </AnimatePresence>
              </span>{" "}
              of {features.length} features
            </div>
          </div>
          <div data-atlas-grid-slot>
            {viewMode === "grid" ? (
              <FeatureGrid features={filteredFeatures} onSelect={openFeature} />
            ) : (
              <TimelineView features={filteredFeatures} onSelect={openFeature} />
            )}
          </div>
        </div>


        {/* Crawlable sitemap of every feature and category page. Visually hidden
            but fully accessible to screen readers and search engines. */}
        <nav aria-label="All feature pages" className="sr-only">
          <h2>All Lovable features</h2>
          <ul>
            {features.map((f) => (
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
