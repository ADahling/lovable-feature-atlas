import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Grid3x3, LayoutList } from "lucide-react";
import { Hero } from "../components/atlas/Hero";
import { FilterBar, type SortMode, type StatusKey } from "../components/atlas/FilterBar";
import { FeatureGrid } from "../components/atlas/FeatureGrid";
import { TimelineView } from "../components/atlas/TimelineView";
import { FeatureDialog } from "../components/atlas/FeatureDialog";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { features as featuresData, type Feature } from "../data/features";
import { useFeatures } from "../hooks/use-features";

type ViewMode = "grid" | "timeline";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lovable Feature Atlas — Every feature, every release" },
      {
        name: "description",
        content:
          "Every Lovable feature, beta, and release through May 2026 — an editorial atlas of the platform.",
      },
      {
        property: "og:title",
        content: "Lovable Feature Atlas — Every feature, every release",
      },
      {
        property: "og:description",
        content:
          "Every Lovable feature, beta, and release through May 2026 — an editorial atlas of the platform.",
      },
      { property: "og:url", content: "https://lovable-feature-atlas.lovable.app/" },
      { property: "og:type", content: "website" },
      {
        name: "twitter:title",
        content: "Lovable Feature Atlas — Every feature, every release",
      },
      {
        name: "twitter:description",
        content:
          "Every Lovable feature, beta, and release through May 2026 — an editorial atlas of the platform.",
      },
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
          name: "Lovable Feature Atlas",
          description:
            "Every Lovable feature, beta, and release through May 2026.",
          url: "https://lovable-feature-atlas.lovable.app/",
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
          <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-emerald/10 via-ink to-ink p-6 sm:p-8 lg:p-10">
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gold/15 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 size-64 rounded-full bg-emerald/15 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div className="max-w-2xl">
                <p className="t-eyebrow text-gold">Lovable shipped · May 2026</p>
                <h2 className="t-card mt-2 text-cream">SEO Review Dashboard is live in Lovable</h2>
                <p className="t-body-sm mt-2 text-cream/70">
                  Lovable just released an on-demand SEO and AEO scan inside the editor. Run it on any project, get prioritized recommendations, and let the agent ship one-click fixes. See what it covers below — or open it from your own Lovable workspace.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const f = features.find((x) => x.id === "seo-review-dashboard");
                    if (f) setSelected(f);
                  }}
                  className="inline-flex items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  See what it does
                </button>
                <a
                  href="https://docs.lovable.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="t-label text-cream/70 underline-offset-4 hover:text-cream hover:underline"
                >
                  Open in Lovable docs ↗
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="container-atlas pt-12 lg:pt-16">
          <div className="flex items-baseline justify-between gap-6 border-b border-cream/10 pb-4">
            <div>
              <p className="t-eyebrow text-emerald">Release notes</p>
              <h2 className="t-card mt-1 text-cream">May 13, 2026 — SEO &amp; AEO launch</h2>
            </div>
            <p className="t-meta hidden text-cream/50 sm:block">3 new features</p>
          </div>
          <p className="t-body-sm mt-4 max-w-3xl text-cream/65">
            Lovable apps are now built to be found — by Google and by AI answer engines. Three releases ship together to close the gap between building and being discovered.
          </p>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {["discoverable-by-default", "chat-with-seo-data", "seo-review-dashboard"].map((id, i) => {
              const f = features.find((x) => x.id === id);
              if (!f) return null;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setSelected(f)}
                    className="group flex h-full w-full flex-col gap-3 rounded-xl border border-cream/10 bg-ink/40 p-5 text-left transition-colors hover:border-emerald/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="t-meta text-cream/45">0{i + 1}</span>
                      <span className="t-meta rounded border border-emerald/30 px-1.5 py-0.5 text-emerald/80">
                        {f.status} · {f.category}
                      </span>
                    </div>
                    <span className="t-label text-cream">{f.name}</span>
                    <span className="t-body-sm text-cream/65">{f.tagline}</span>
                    <ul className="mt-1 flex flex-col gap-1.5 border-t border-cream/10 pt-3">
                      {f.capabilities.slice(0, 3).map((c, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-gold/70" />
                          <span className="t-body-sm text-cream/70">{c}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="t-meta text-cream/45">{f.pricing}</span>
                      <span className="t-meta text-emerald/80 group-hover:text-emerald">Read more →</span>
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
        <div className="container-atlas section-y">
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
