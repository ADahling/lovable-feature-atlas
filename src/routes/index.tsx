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
        <div className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 sm:py-20 lg:px-12">
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
                className="gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-cream/70 data-[state=on]:bg-emerald/20 data-[state=on]:text-cream"
              >
                <Grid3x3 className="size-3.5" aria-hidden />
                Grid
              </ToggleGroupItem>
              <ToggleGroupItem
                value="timeline"
                aria-label="Timeline view"
                className="gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-cream/70 data-[state=on]:bg-emerald/20 data-[state=on]:text-cream"
              >
                <LayoutList className="size-3.5" aria-hidden />
                Timeline
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <p className="mb-12 font-mono text-[12px] uppercase tracking-[0.15em] text-cream/50">
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
