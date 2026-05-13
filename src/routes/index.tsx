import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Grid3x3, LayoutList } from "lucide-react";
import { Hero } from "../components/atlas/Hero";
import { FilterBar, type SortMode, type StatusKey } from "../components/atlas/FilterBar";
import { FeatureGrid } from "../components/atlas/FeatureGrid";
import { TimelineView } from "../components/atlas/TimelineView";
import { FeatureDialog } from "../components/atlas/FeatureDialog";
import { GscStatusPanel } from "../components/atlas/GscStatusPanel";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { features as featuresData, type Feature } from "../data/features";
import { useFeatures } from "../hooks/use-features";

type ViewMode = "grid" | "timeline";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "The Lovable Feature Atlas — community catalog of every Lovable release" },
      {
        name: "description",
        content:
          "An independent, fan-built catalog of every Lovable feature, beta, and release through May 2026. Built by Alicia Dahling for the Lovable community — not affiliated with Lovable AB.",
      },
      {
        property: "og:title",
        content: "The Lovable Feature Atlas — community catalog",
      },
      {
        property: "og:description",
        content:
          "Independent, fan-built catalog of every Lovable feature, beta, and release through May 2026. By Alicia Dahling — not affiliated with Lovable AB.",
      },
      { property: "og:url", content: "https://lovable-feature-atlas.lovable.app/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://lovable-feature-atlas.lovable.app/og-image.jpg" },
      { property: "og:image:width", content: "1216" },
      { property: "og:image:height", content: "640" },
      {
        name: "twitter:title",
        content: "The Lovable Feature Atlas — community catalog",
      },
      {
        name: "twitter:description",
        content:
          "Independent, fan-built catalog of every Lovable feature, beta, and release through May 2026. By Alicia Dahling — not affiliated with Lovable AB.",
      },
      { name: "twitter:image", content: "https://lovable-feature-atlas.lovable.app/og-image.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://lovable-feature-atlas.lovable.app/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "The Lovable Feature Atlas",
          description:
            "Independent, fan-built catalog of every Lovable feature, beta, and release through May 2026.",
          url: "https://lovable-feature-atlas.lovable.app/",
          isAccessibleForFree: true,
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
          },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: featuresData.length,
            itemListElement: featuresData.slice(0, 25).map((f, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: f.name,
              description: f.tagline,
            })),
          },
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
  const [selected, setSelected] = useState<Feature | null>(null);

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

  return (
    <>
      <Hero />
      <main className="relative bg-ink text-cream">
        <section className="container-atlas pt-10 lg:pt-14">
          <div className="relative overflow-hidden rounded-2xl border border-emerald/30 bg-gradient-to-br from-emerald/10 via-ink to-ink p-6 sm:p-8 lg:p-10">
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-emerald/15 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div className="max-w-2xl">
                <p className="t-eyebrow text-emerald">Lovable shipped · May 2026</p>
                <h2 className="t-card mt-2 text-cream">SEO Review Dashboard is live in Lovable</h2>
                <p className="t-body-sm mt-2 text-cream/70">
                  Lovable just released an on-demand SEO and AEO scan inside the editor. Run it on any project, get prioritized recommendations, and let the agent ship one-click fixes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const f = features.find((x) => x.id === "seo-review-dashboard");
                    if (f) setSelected(f);
                  }}
                  className="inline-flex items-center justify-center rounded-md bg-emerald px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-emerald-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald/60"
                >
                  Open the dashboard
                </button>
                <a
                  href="https://docs.lovable.dev/features/seo"
                  target="_blank"
                  rel="noreferrer"
                  className="t-label text-cream/70 underline-offset-4 hover:text-cream hover:underline"
                >
                  Read the docs ↗
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="container-atlas pt-12 lg:pt-16">
          <div className="flex items-baseline justify-between gap-6 border-b border-cream/15 pb-4">
            <div>
              <p className="t-eyebrow text-emerald">What Lovable shipped</p>
              <h2 className="t-card mt-1 text-cream">May 13, 2026 — SEO &amp; AEO launch</h2>
            </div>
            <p className="t-meta hidden text-cream/50 sm:block">3 new features</p>
          </div>
          <p className="t-body-sm mt-4 max-w-3xl text-cream/70">
            Lovable shipped three releases together so projects ship search-ready for both Google and AI answer engines like ChatGPT and Perplexity. Here's what each one does, pulled from the official docs.
          </p>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-xl border border-emerald/25 bg-emerald/15 md:grid-cols-3">
            {["discoverable-by-default", "chat-with-seo-data", "seo-review-dashboard"].map((id, i) => {
              const f = features.find((x) => x.id === id);
              if (!f) return null;
              return (
                <li key={id} className="bg-ink">
                  <button
                    type="button"
                    onClick={() => setSelected(f)}
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
          <div className="mb-4 flex justify-end">
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
          <p className="t-meta mb-12 text-cream/50">
            Showing {filteredFeatures.length} of {features.length} features
          </p>
          {viewMode === "grid" ? (
            <FeatureGrid features={filteredFeatures} onSelect={setSelected} />
          ) : (
            <TimelineView features={filteredFeatures} onSelect={setSelected} />
          )}
        </div>
        <FeatureDialog
          feature={selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        />
      </main>
    </>
  );
}
