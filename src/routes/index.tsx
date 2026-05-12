import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "../components/atlas/Hero";
import { FilterBar, type SortMode, type StatusKey } from "../components/atlas/FilterBar";
import { FeatureGrid } from "../components/atlas/FeatureGrid";
import { FeatureDialog } from "../components/atlas/FeatureDialog";
import { features, type Feature } from "../data/features";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lovable Feature Atlas" },
      {
        name: "description",
        content:
          "Every Lovable feature, beta, and release through May 2026 — an editorial atlas of the platform.",
      },
    ],
  }),
});

function Index() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<StatusKey>>(
    new Set(["GA", "Beta", "Removed"]),
  );
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [query, setQuery] = useState("");
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
  }, [selectedCategories, selectedStatuses, sortMode, query]);

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
        <div className="mx-auto w-full max-w-[1400px] px-6 py-12 lg:px-12">
          <p className="mb-8 font-mono text-[12px] uppercase tracking-[0.15em] text-cream/50">
            Showing {filteredFeatures.length} of {features.length} features
          </p>
          <FeatureGrid features={filteredFeatures} onSelect={setSelected} />
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
