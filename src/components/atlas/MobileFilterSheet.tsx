import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { allCategoryNames } from "../../lib/categories";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../ui/sheet";
import type { StatusKey, SortMode } from "./FilterBar";

// Display labels only — data values, URL params, and DB rows keep "Removed".
const STATUS_LABEL: Record<StatusKey, string> = {
  GA: "GA",
  Beta: "Beta",
  Removed: "Retired",
};

const CATEGORIES = Array.from(allCategoryNames());
const SORTS: { key: SortMode; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "az", label: "A → Z" },
];

interface Props {
  selectedCategories: Set<string>;
  onToggleCategory: (cat: string) => void;
  selectedStatuses: Set<StatusKey>;
  onStatusesChange: (next: Set<StatusKey>) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  query: string;
  onQueryChange: (q: string) => void;
}

/**
 * Bottom-sheet filter surface for mobile (<768px). A single "Filter & sort"
 * trigger opens a drag-handle bottom sheet with:
 *   - a wrapping grid of category chips
 *   - status toggles
 *   - sort control
 *   - Apply + Clear
 *
 * Filter changes are applied to shared state as the user taps (optimistic),
 * so "Apply" is really "Done" — closing the sheet — but is labelled Apply
 * to match the native mental model.
 */
export function MobileFilterSheet(props: Props) {
  const {
    selectedCategories,
    onToggleCategory,
    selectedStatuses,
    onStatusesChange,
    sortMode,
    onSortChange,
    query,
    onQueryChange,
  } = props;
  const [open, setOpen] = useState(false);

  const activeCount =
    selectedCategories.size +
    (selectedStatuses.size < 3 ? 1 : 0) +
    (query.length > 0 ? 1 : 0) +
    (sortMode !== "newest" ? 1 : 0);

  function toggleStatus(s: StatusKey) {
    const next = new Set(selectedStatuses);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onStatusesChange(next);
  }

  function clearAll() {
    selectedCategories.forEach((c) => onToggleCategory(c));
    onStatusesChange(new Set(["GA", "Beta", "Removed"] as StatusKey[]));
    onQueryChange("");
    onSortChange("newest");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Filters — open filter and sort"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald/40 bg-ink/85 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-cream backdrop-blur"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-gold/20 px-1.5 text-[10px] font-medium text-gold">
              {activeCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-emerald/30 bg-ink p-0 text-cream [overscroll-behavior:contain]"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <span aria-hidden className="h-1.5 w-10 rounded-full bg-cream/25" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
            Filter &amp; sort
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close filter"
            className="grid size-11 place-items-center rounded-full text-cream/60 hover:text-cream"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-4">
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">
            Search
          </label>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search features"
            className="min-h-11 w-full rounded-lg border border-emerald/30 bg-transparent px-3 text-sm text-cream placeholder:text-cream/50 focus:border-emerald focus:outline-none"
          />
        </div>

        {/* Categories grid */}
        <div className="px-5 pb-5">
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategories.has(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onToggleCategory(cat)}
                  aria-pressed={active}
                  className={
                    "inline-flex min-h-11 items-center rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors " +
                    (active
                      ? "border-emerald bg-emerald text-cream"
                      : "border-emerald/30 text-cream/70 hover:border-emerald hover:text-cream")
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="px-5 pb-5">
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">
            Status
          </label>
          <div className="flex gap-2">
            {(["GA", "Beta", "Removed"] as StatusKey[]).map((s) => {
              const active = selectedStatuses.has(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  aria-pressed={active}
                  className={
                    "flex-1 min-h-11 rounded-lg border font-mono text-[11px] uppercase tracking-wider transition-colors " +
                    (active
                      ? "border-emerald bg-emerald/20 text-cream"
                      : "border-cream/15 text-cream/60")
                  }
                >
                  {STATUS_LABEL[s]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort */}
        <div className="px-5 pb-6">
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50">
            Sort
          </label>
          <div className="flex gap-2">
            {SORTS.map((s) => {
              const active = sortMode === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => onSortChange(s.key)}
                  aria-pressed={active}
                  className={
                    "flex-1 min-h-11 rounded-lg border font-mono text-[11px] uppercase tracking-wider transition-colors " +
                    (active
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-cream/15 text-cream/60")
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions — pinned by natural flow at the end */}
        <div
          className="sticky bottom-0 flex items-center gap-3 border-t border-cream/10 bg-ink/95 px-5 py-4 backdrop-blur"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
        >
          <button
            type="button"
            onClick={clearAll}
            className="min-h-11 rounded-lg border border-cream/15 px-4 font-mono text-[11px] uppercase tracking-wider text-cream/70"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 min-h-11 rounded-lg bg-emerald px-4 font-mono text-[11px] uppercase tracking-wider text-cream"
          >
            Apply
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
