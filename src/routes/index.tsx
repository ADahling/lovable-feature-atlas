import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Check, Link2 } from "lucide-react";
import { Hero } from "../components/atlas/Hero";
import { FilterBar, type SortMode, type StatusKey, type ViewMode } from "../components/atlas/FilterBar";
import { FeatureGrid } from "../components/atlas/FeatureGrid";
import { TimelineView } from "../components/atlas/TimelineView";
import { OnboardingModule } from "../components/atlas/OnboardingModule";
import type { FeatureCard as Feature } from "../lib/features.functions";
import { useFeatures } from "../hooks/use-features";
import { buildCanonicalTags } from "../lib/canonical-meta";
import { allCategoryNames, categorySlug } from "../lib/categories";
import {
  PRESET_TITLES,
  presetById,
  type PresetDef,
  type PresetFilterState,
  type Recency,
} from "../lib/atlas-presets";

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
  return raw === "timeline" ? "timeline" : "grid";
}

function parseRecency(raw: string): Recency {
  return raw === "30d" ? "30d" : "";
}

interface UIState {
  categories: Set<string>;
  statuses: Set<StatusKey>;
  sort: SortMode;
  query: string;
  view: ViewMode;
  recency: Recency;
  preset: string;
}

function stateFromSearch(s: IndexSearch): UIState {
  return {
    categories: new Set(parseCategories(s.cat)),
    statuses: new Set(parseStatuses(s.status)),
    sort: parseSort(s.sort),
    query: s.q ?? "",
    view: parseView(s.view),
    recency: parseRecency(s.recency),
    preset: s.preset ?? "",
  };
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
    view: u.view === "grid" ? "" : u.view,
    recency: u.recency,
    preset: u.preset,
  };
}

/** Search values that are equal to the schema default — omit from URL. */
function isDefault(s: IndexSearch): boolean {
  return (
    !s.cat && !s.status && s.sort === "newest" && !s.q && !s.view && !s.recency && !s.preset
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
  loader: async () => {
    const { markCacheable } = await import("../lib/features.functions");
    await markCacheable();
    return null;
  },
  head: ({ match }) => {
    const s = (match?.search ?? {}) as IndexSearch;
    const { title, description } = titleFromSearch(s);
    return {
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

function Index() {
  const { features } = useFeatures();
  const initialSearch = Route.useSearch();
  const navigate = useNavigate();

  const initialState = useMemo(() => stateFromSearch(initialSearch as IndexSearch), []);
  // ^ read once — subsequent URL updates flow from state, not the other way.

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(initialState.categories);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<StatusKey>>(initialState.statuses);
  const [sortMode, setSortMode] = useState<SortMode>(initialState.sort);
  const [query, setQuery] = useState(initialState.query);
  const [viewMode, setViewMode] = useState<ViewMode>(initialState.view);
  const [recency, setRecency] = useState<Recency>(initialState.recency);
  const [preset, setPreset] = useState<string>(initialState.preset);
  const [linkCopied, setLinkCopied] = useState(false);

  // Sync state → URL. Skip the first commit so we don't rewrite the URL the
  // visitor arrived on. Dropping default values keeps a fresh visit's URL at
  // a clean "/". `replace: true` avoids polluting browser history.
  const urlMountRef = useRef(true);
  useEffect(() => {
    if (urlMountRef.current) {
      urlMountRef.current = false;
      return;
    }
    const next = searchFromState({
      categories: selectedCategories,
      statuses: selectedStatuses,
      sort: sortMode,
      query,
      view: viewMode,
      recency,
      preset,
    });
    const clean = isDefault(next) ? ({} as IndexSearch) : next;
    void navigate({ to: "/", search: clean, replace: true });
  }, [selectedCategories, selectedStatuses, sortMode, query, viewMode, recency, preset, navigate]);

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

  // Honor a preset= URL that arrived cold (e.g. someone shared a preset link
  // without the underlying filters). If preset is set but state doesn't
  // reflect it, don't overwrite — the URL is authoritative for filter state
  // and preset is just a label. But if only preset= is present, hydrate
  // filters from the preset definition.
  const presetHydrationRef = useRef(false);
  useEffect(() => {
    if (presetHydrationRef.current) return;
    presetHydrationRef.current = true;
    if (!initialState.preset) return;
    const p = presetById(initialState.preset);
    if (!p || !p.applies) return;
    // If any filter is already set from URL, trust the URL. Otherwise hydrate.
    const anySet =
      initialState.categories.size > 0 ||
      initialState.statuses.size !== 3 ||
      initialState.sort !== "newest" ||
      initialState.query !== "" ||
      initialState.view !== "grid" ||
      initialState.recency !== "";
    if (anySet) return;
    setSelectedCategories(new Set(p.applies.categories));
    setSelectedStatuses(new Set(p.applies.statuses));
    setSortMode(p.applies.sort);
    setQuery(p.applies.query);
    setViewMode(p.applies.view);
    setRecency(p.applies.recency);
  }, [initialState]);

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

  const monthlyReleaseCount = useMemo(() => {
    if (!latestFeature) return 0;
    const ref = new Date(latestFeature.releaseDate);
    const y = ref.getUTCFullYear();
    const m = ref.getUTCMonth();
    return features.filter((f) => {
      if (!f.releaseDate) return false;
      const d = new Date(f.releaseDate);
      return d.getUTCFullYear() === y && d.getUTCMonth() === m;
    }).length;
  }, [features, latestFeature]);

  const hasActiveFilters =
    selectedCategories.size > 0 ||
    selectedStatuses.size !== 3 ||
    sortMode !== "newest" ||
    query.trim().length > 0 ||
    viewMode !== "grid" ||
    recency !== "";

  async function copyViewLink() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      /* clipboard blocked — silent */
    }
  }

  return (
    <>
      <main className="relative bg-ink text-cream">
        <Hero />

        {latestFeature && (
          <section className="container-atlas pt-6 lg:pt-8" aria-label="Latest release">
            <div className="group relative overflow-hidden rounded-lg border border-cream/[0.06] transition-colors hover:border-gold/30">
              <span
                aria-hidden
                className="ticker-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 motion-reduce:hidden"
              />
              <a
                href={`/features/${latestFeature.id}`}
                className="relative flex flex-col items-start gap-2.5 bg-transparent px-4 py-2.5 hover:bg-ink/40 sm:flex-row sm:items-center sm:gap-4"
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
                  {monthlyReleaseCount > 1 && (
                    <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-gold/70 sm:inline">
                      {monthlyReleaseCount} this month
                    </span>
                  )}
                  <span className="t-meta text-emerald/70 transition-colors group-hover:text-emerald-glow">
                    Read →
                  </span>
                </div>
              </a>
            </div>
          </section>
        )}

        <OnboardingModule onPreset={applyPreset} />

        <section
          className="container-atlas pt-20 pb-6 lg:pt-28 lg:pb-8"
          aria-labelledby="catalog-intro"
        >
          <div className="max-w-3xl">
            <p className="t-eyebrow text-emerald">The catalog</p>
            <h2 id="catalog-intro" className="t-title mt-3 text-cream">
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
          onStatusesChange={onStatusesChange}
          sortMode={sortMode}
          onSortChange={onSortChange}
          query={query}
          onQueryChange={onQueryChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          totalCount={features.length}
        />
        <div id="features" className="container-atlas pb-24 pt-8 lg:pb-32 lg:pt-10 scroll-mt-24" style={{ overflowAnchor: "none" }}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="t-meta text-cream/50" aria-live="polite" aria-atomic="true">
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
              {recency === "30d" && (
                <span className="ml-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-gold/70">
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
                  <FeatureGrid features={filteredFeatures} onSelect={openFeature} />
                ) : (
                  <TimelineView features={filteredFeatures} onSelect={openFeature} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

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
      {/* Preset registry — referenced to keep the import used across dead-code splits. */}
      <span data-atlas-presets={PRESETS.length} hidden />
    </>
  );
}
