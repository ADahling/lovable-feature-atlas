import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Check, Link2 } from "lucide-react";
import { Hero } from "../components/atlas/Hero";
import {
  FilterBar,
  type SortMode,
  type StatusKey,
  type ViewMode,
} from "../components/atlas/FilterBar";
import { FeatureGrid } from "../components/atlas/FeatureGrid";
import { TimelineView } from "../components/atlas/TimelineView";
import { GuidedCollectionRail } from "../components/atlas/GuidedCollectionRail";
import { NowShowing } from "../components/atlas/NowShowing";
import { CastRoll } from "../components/atlas/CastRoll";
import { FeatureListVirtual } from "../components/atlas/FeatureListVirtual";
import {
  getHomeCatalog,
  type FeatureCard as Feature,
  type HomeCatalogResult,
} from "../lib/features.functions";
import { completeCatalogQueryOptions } from "../lib/catalog-query";
import {
  HOME_CATALOG_SEARCH_DEFAULTS,
  requiresCompleteHomeCatalog,
  toCompleteHomeCatalogResult,
} from "../lib/home-catalog";
import { useFeatures } from "../hooks/use-features";
import { buildCanonicalTags } from "../lib/canonical-meta";
import { allCategoryNames, categorySlug } from "../lib/categories";
import {
  PRESET_TITLES,
  type PresetDef,
  type PresetFilterState,
  type Recency,
} from "../lib/atlas-presets";
import { resolveHomePresetState, type HomePresetState as UIState } from "../lib/home-preset";

const homeCanonical = buildCanonicalTags({ path: "/" });

// ---- URL search schema --------------------------------------------------
// Every filter that a visitor can toggle round-trips through the URL so any
// filtered view — including the five onboarding presets — has a stable
// shareable link. Values default to the same defaults as the UI so the
// canonical "/" URL stays clean when nothing is filtered.

const searchSchema = z.object({
  cat: fallback(z.string(), "").default(""),
  status: fallback(z.string(), "").default(""),
  sort: fallback(z.string(), "newest").default("newest"),
  q: fallback(z.string(), "").default(""),
  view: fallback(z.string(), "grid").default("grid"),
  recency: fallback(z.string(), "").default(""),
  preset: fallback(z.string(), "").default(""),
});

type IndexSearch = z.infer<typeof searchSchema>;

const ALL_CATEGORY_NAMES = new Set(allCategoryNames());
const ALL_STATUSES: StatusKey[] = ["GA", "Beta", "Removed"];
const INITIAL_VISIBLE_FEATURES = 24;
const FEATURE_PAGE_SIZE = 24;
const STATUS_BY_KEY: Record<string, StatusKey> = {
  ga: "GA",
  beta: "Beta",
  removed: "Removed",
};

function parseCategories(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter((s) => ALL_CATEGORY_NAMES.has(s));
}

function parseStatuses(raw: string): StatusKey[] {
  if (!raw) return [...ALL_STATUSES];
  const out: StatusKey[] = [];
  for (const p of raw.split(",")) {
    const mapped = STATUS_BY_KEY[p.trim().toLowerCase()];
    if (mapped && !out.includes(mapped)) out.push(mapped);
  }
  return out.length > 0 ? out : [...ALL_STATUSES];
}

function parseSort(raw: string): SortMode {
  return raw === "oldest" || raw === "az" ? raw : "newest";
}

function parseView(raw: string): ViewMode {
  if (raw === "timeline") return "timeline";
  if (raw === "list") return "list";
  return "grid";
}

function parseRecency(raw: string): Recency {
  return raw === "30d" ? "30d" : "";
}

function stateFromSearch(s: IndexSearch): UIState {
  const state: UIState = {
    categories: new Set(parseCategories(s.cat)),
    statuses: new Set(parseStatuses(s.status)),
    sort: parseSort(s.sort),
    query: s.q ?? "",
    view: parseView(s.view),
    recency: parseRecency(s.recency),
    preset: s.preset ?? "",
  };
  return resolveHomePresetState(state);
}

/** Serialize UI state to the sparsest possible search object (drop defaults). */
function searchFromState(u: UIState): IndexSearch {
  const cats = Array.from(u.categories).sort().join(",");
  const allStatuses = u.statuses.size === 3;
  const statusStr = allStatuses
    ? ""
    : Array.from(u.statuses)
        .map((s) => s.toLowerCase())
        .sort()
        .join(",");
  return {
    cat: cats,
    status: statusStr,
    sort: u.sort,
    q: u.query,
    view: u.view,
    recency: u.recency,
    preset: u.preset,
  };
}

function searchesMatch(a: IndexSearch, b: IndexSearch): boolean {
  return (Object.keys(HOME_CATALOG_SEARCH_DEFAULTS) as Array<keyof IndexSearch>).every(
    (key) => a[key] === b[key],
  );
}

function titleFromSearch(s: IndexSearch): { title: string; description: string } {
  const preset = s.preset as keyof typeof PRESET_TITLES;
  if (preset && PRESET_TITLES[preset]) {
    return {
      title: `${PRESET_TITLES[preset]} — The Lovable Feature Atlas`,
      description: `A curated view of the Lovable Feature Atlas: ${PRESET_TITLES[preset].toLowerCase()}.`,
    };
  }
  return {
    title: "The Lovable Feature Atlas — Complete Release Catalog",
    description:
      "The independent, fan-built catalog of every Lovable feature, beta, and release — filter, search, and explore the full changelog, updated daily.",
  };
}

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({
    requiresCompleteCatalog: requiresCompleteHomeCatalog(search),
  }),
  loader: async ({ context, deps }) => {
    if (!deps.requiresCompleteCatalog) return getHomeCatalog();
    const catalog = await context.queryClient.ensureQueryData(completeCatalogQueryOptions);
    return toCompleteHomeCatalogResult(catalog);
  },
  // Strip default values from the URL so a fresh visit stays at a clean "/".
  search: { middlewares: [stripSearchParams(HOME_CATALOG_SEARCH_DEFAULTS)] },
  headers: () => ({
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  }),
  head: ({ match }) => {
    const s = (match?.search ?? {}) as IndexSearch;
    const { title, description } = titleFromSearch(s);
    return {
      links: [
        // The hero key art must never delay the title LCP — preload the
        // width-capped WebP so the paint lands with the first frame.
        {
          rel: "preload",
          as: "image",
          href: "/art/hero-key-art.jpg",
          imageSrcSet:
            "/art/hero-key-art-960.webp 960w, /art/hero-key-art-1600.webp 1600w, /art/hero-key-art-2400.webp 2400w",
          imageSizes: "100vw",
          fetchPriority: "high" as const,
        },
        ...homeCanonical.links,
      ],
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "https://atlas.dahlingdigital.com/og-image.png" },
        { property: "og:image:width", content: "1536" },
        { property: "og:image:height", content: "1024" },
        {
          property: "og:image:alt",
          content:
            "The Lovable Feature Atlas — cream serif wordmark on a deep forest-green background with a glossy emerald-and-gold heart mark. Subtitle: Community Catalog · Every Feature · 2024–2026. Credit: by Alicia Dahling, Dahling Digital. Not affiliated with Lovable AB.",
        },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://atlas.dahlingdigital.com/og-image.png" },
        {
          name: "twitter:image:alt",
          content:
            "The Lovable Feature Atlas — cream serif wordmark on a deep forest-green background with a glossy emerald-and-gold heart mark. Subtitle: Community Catalog · Every Feature · 2024–2026.",
        },
        { name: "twitter:card", content: "summary_large_image" },
        ...homeCanonical.meta,
      ],
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
                    urlTemplate: "https://atlas.dahlingdigital.com/?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          }),
        },
      ],
    };
  },
});

/**
 * Replaces the old "Show 24 more" button: the next page of cards streams in
 * automatically as the visitor approaches the end of the grid. A visible
 * button remains only where IntersectionObserver is unavailable.
 */
function AutoRevealSentinel({
  remaining,
  onReveal,
}: {
  remaining: number;
  onReveal: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ioSupported, setIoSupported] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setIoSupported(false);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onReveal();
      },
      { rootMargin: "700px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onReveal]);
  return (
    <div ref={ref} className="mt-6 flex justify-center">
      {ioSupported ? (
        <span className="sr-only" aria-live="polite">
          Loading more features
        </span>
      ) : (
        <button
          type="button"
          onClick={onReveal}
          className="btn-foil rounded-md px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          Show {Math.min(FEATURE_PAGE_SIZE, remaining)} more
        </button>
      )}
    </div>
  );
}

function Index() {
  const initialCatalog = Route.useLoaderData() as HomeCatalogResult;
  const { features, isComplete, error, retry } = useFeatures({
    initialData: {
      features: initialCatalog.features,
      generatedAt: initialCatalog.generatedAt,
      source: initialCatalog.source,
    },
    initialDataComplete: initialCatalog.isComplete,
  });
  const catalogTotal = isComplete ? features.length : initialCatalog.total;
  const catalogFailed = !isComplete && Boolean(error);
  const catalogPending = !isComplete && !catalogFailed;
  const currentSearch = Route.useSearch();
  const navigate = useNavigate();

  const [initialState] = useState(() => stateFromSearch(currentSearch as IndexSearch));
  // ^ read once — subsequent URL updates flow from state, not the other way.

  // View preference — a visitor who chose the list view keeps it on their
  // next clean visit. URL params always win; this only applies when the
  // visit carries no explicit view.
  const viewPrefApplied = useRef(false);

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    initialState.categories,
  );
  const [selectedStatuses, setSelectedStatuses] = useState<Set<StatusKey>>(initialState.statuses);
  const [sortMode, setSortMode] = useState<SortMode>(initialState.sort);
  const [query, setQuery] = useState(initialState.query);
  const [viewMode, setViewMode] = useState<ViewMode>(initialState.view);
  const [recency, setRecency] = useState<Recency>(initialState.recency);
  const [preset, setPreset] = useState<string>(initialState.preset);
  const [linkCopied, setLinkCopied] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_FEATURES);

  // Sync state → URL only when the normalized search actually changed. A
  // mount-ref guard runs twice in development's strict effects and caused a
  // redundant initial navigation that could restore scroll after interaction.
  // Dropping default values keeps a fresh visit's URL at a clean "/".
  useEffect(() => {
    const next = searchFromState({
      categories: selectedCategories,
      statuses: selectedStatuses,
      sort: sortMode,
      query,
      view: viewMode,
      recency,
      preset,
    });
    if (searchesMatch(next, currentSearch as IndexSearch)) return;
    // In-place URL reflection of filter state — never move the viewport.
    void navigate({ to: "/", search: next, replace: true, resetScroll: false });
  }, [
    selectedCategories,
    selectedStatuses,
    sortMode,
    query,
    viewMode,
    recency,
    preset,
    currentSearch,
    navigate,
  ]);

  const openFeature = useCallback(
    (f: Feature) => {
      void navigate({ to: "/features/$slug", params: { slug: f.id } });
    },
    [navigate],
  );

  const onViewModeChange = useCallback((next: ViewMode) => {
    if (typeof window === "undefined") {
      setViewMode(next);
      return;
    }
    try {
      window.localStorage.setItem("atlas.catalog-view", next);
    } catch {
      /* private mode — the URL still carries the view */
    }
    const y = window.scrollY;
    setViewMode(next);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo({ top: y }));
    });
  }, []);

  // Apply the stored view preference once, only on a clean default visit.
  useEffect(() => {
    if (viewPrefApplied.current) return;
    viewPrefApplied.current = true;
    if (requiresCompleteHomeCatalog(currentSearch as IndexSearch)) return;
    try {
      const pref = window.localStorage.getItem("atlas.catalog-view");
      if (pref === "list" || pref === "timeline") setViewMode(pref);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
    // Manual edits invalidate the preset label — it's no longer a canonical view.
    setPreset("");
  };

  const onStatusesChange = (next: Set<StatusKey>) => {
    setSelectedStatuses(next);
    setPreset("");
  };

  const onSortChange = (next: SortMode) => {
    setSortMode(next);
    setPreset("");
  };

  const onQueryChange = (next: string) => {
    setQuery(next);
    if (next.trim().length > 0) setPreset("");
  };

  // Filter/sort scroll-into-view (unchanged — search still narrows in place).
  const filterMountRef = useRef(true);
  useEffect(() => {
    if (filterMountRef.current) {
      filterMountRef.current = false;
      return;
    }
    if (typeof document === "undefined") return;
    const el = document.getElementById("features");
    if (!el) return;
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
  }, [selectedCategories, selectedStatuses, sortMode, recency]);

  const applyPreset = useCallback(
    (p: PresetDef) => {
      if (p.navTo) {
        void navigate({ to: p.navTo });
        return;
      }
      const s: PresetFilterState | undefined = p.applies;
      if (!s) return;
      setSelectedCategories(new Set(s.categories));
      setSelectedStatuses(new Set(s.statuses));
      setSortMode(s.sort);
      setQuery(s.query);
      setViewMode(s.view);
      setRecency(s.recency);
      setPreset(p.id);
    },
    [navigate],
  );

  const filteredFeatures = useMemo(() => {
    const q = query.trim().toLowerCase();
    const recencyCutoff =
      recency === "30d" ? Date.now() - 30 * 86400_000 : Number.NEGATIVE_INFINITY;

    let list = features.filter((f) => {
      if (!selectedStatuses.has(f.status)) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(f.category)) return false;
      if (recencyCutoff > Number.NEGATIVE_INFINITY) {
        const t = new Date(f.releaseDate).getTime();
        if (Number.isNaN(t) || t < recencyCutoff) return false;
      }
      if (!q) return true;
      const blob = (f.name + " " + f.tagline + " " + f.category).toLowerCase();
      return blob.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sortMode === "newest") return b.releaseDate.localeCompare(a.releaseDate);
      if (sortMode === "oldest") return a.releaseDate.localeCompare(b.releaseDate);
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [features, selectedCategories, selectedStatuses, sortMode, query, recency]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_FEATURES);
  }, [selectedCategories, selectedStatuses, sortMode, query, viewMode, recency, preset]);

  const visibleFeatures = useMemo(
    () => filteredFeatures.slice(0, visibleCount),
    [filteredFeatures, visibleCount],
  );

  const hasActiveFilters =
    selectedCategories.size > 0 ||
    selectedStatuses.size !== 3 ||
    sortMode !== "newest" ||
    query.trim().length > 0 ||
    viewMode !== "grid" ||
    recency !== "";

  async function copyViewLink() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {
      /* fall through to legacy fallback */
    }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "0";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        /* both paths failed — leave ok=false */
      }
    }
    // Always flip UI so the user gets feedback; if copy failed the URL is
    // still in the address bar and shareable manually.
    setLinkCopied(ok);
    window.setTimeout(() => setLinkCopied(false), ok ? 1800 : 1200);
  }

  return (
    <>
      <main className="relative bg-ink text-cream">
        <Hero
          stats={{
            total: initialCatalog.total,
            categories: initialCatalog.categoryCount,
            ga: initialCatalog.gaCount,
          }}
        />

        <NowShowing features={features} />

        <CastRoll features={features} isComplete={isComplete} />

        <GuidedCollectionRail onPreset={applyPreset} />

        <section
          id="catalog"
          className="container-atlas scroll-mt-16 pt-20 pb-6 lg:pt-28 lg:pb-8"
          aria-labelledby="catalog-intro"
        >
          <div className="max-w-3xl">
            <p className="t-eyebrow text-gold">The full catalog</p>
            <h2 id="catalog-intro" className="t-title mt-3 text-cream">
              Every feature ever shipped.
            </h2>
            <p className="t-body mt-4 text-cream/75">
              Filter by category, status, or search. Each entry links to the primary source on{" "}
              <span className="whitespace-nowrap">docs.lovable.dev</span> so nothing here
              second-guesses the official record.
            </p>
          </div>
        </section>
        {!isComplete && (
          <div
            role={catalogFailed ? "alert" : "status"}
            aria-live="polite"
            className="container-atlas pb-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gold/25 bg-gold/[0.06] px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-cream/70">
                {catalogPending
                  ? `Loading all ${catalogTotal} features. Showing the first ${features.length} while the catalog finishes.`
                  : `The full catalog did not load. Showing the first ${features.length} of ${catalogTotal}.`}
              </p>
              {catalogFailed && (
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-md border border-gold/35 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-gold transition-colors hover:border-gold/70 hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
        <FilterBar
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          selectedStatuses={selectedStatuses}
          onStatusesChange={onStatusesChange}
          sortMode={sortMode}
          onSortChange={onSortChange}
          query={query}
          onQueryChange={onQueryChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          totalCount={catalogTotal}
          disabled={false}
        />
        <div
          id="features"
          className="container-atlas pb-24 pt-8 lg:pb-32 lg:pt-10 scroll-mt-24"
          style={{ overflowAnchor: "none" }}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="t-meta text-cream/60" aria-live="polite" aria-atomic="true">
              {isComplete ? (
                viewMode === "list" ? (
                  <>
                    All {filteredFeatures.length} matching features ({catalogTotal} total) · zero
                    pagination
                  </>
                ) : (
                  <>
                    Showing{" "}
                    <span className="relative inline-block align-baseline tabular-nums text-cream/85">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={`${visibleFeatures.length}-${filteredFeatures.length}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="inline-block"
                        >
                          {visibleFeatures.length}
                        </motion.span>
                      </AnimatePresence>
                    </span>{" "}
                    of {filteredFeatures.length} matching features ({catalogTotal} total)
                  </>
                )
              ) : (
                <>
                  Previewing {visibleFeatures.length} of {catalogTotal} features
                </>
              )}
              {recency === "30d" && (
                <span className="ml-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-gold">
                  · last 30 days
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={copyViewLink}
                aria-label={linkCopied ? "Link copied" : "Copy link to this view"}
                className="group inline-flex items-center gap-1.5 rounded-md border border-cream/12 bg-transparent px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-cream/70 transition-colors hover:border-gold/50 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                {linkCopied ? (
                  <Check className="size-3.5 text-emerald" aria-hidden />
                ) : (
                  <Link2 className="size-3.5" aria-hidden />
                )}
                <span>{linkCopied ? "Copied" : "Copy link to this view"}</span>
              </button>
            )}
          </div>
          <div data-atlas-grid-slot className="relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="motion-reduce:transition-none"
              >
                {viewMode === "grid" ? (
                  <FeatureGrid features={visibleFeatures} onSelect={openFeature} />
                ) : viewMode === "list" ? (
                  <FeatureListVirtual features={filteredFeatures} />
                ) : (
                  <TimelineView features={visibleFeatures} onSelect={openFeature} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {isComplete && viewMode !== "list" && visibleFeatures.length < filteredFeatures.length && (
            <AutoRevealSentinel
              remaining={filteredFeatures.length - visibleFeatures.length}
              onReveal={() =>
                setVisibleCount((current) =>
                  Math.min(current + FEATURE_PAGE_SIZE, filteredFeatures.length),
                )
              }
            />
          )}
        </div>
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
