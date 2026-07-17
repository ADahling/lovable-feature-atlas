import { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, X, Grid3x3, LayoutList, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { allCategoryNames } from "../../lib/categories";
import { iconForCategory } from "../../lib/category-icons";
import { categoryAccentVar } from "../../lib/category-theme";
import { Input } from "../ui/input";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MobileFilterSheet } from "./MobileFilterSheet";

const CATEGORIES = Array.from(allCategoryNames());

export type StatusKey = "GA" | "Beta" | "Removed";
export type SortMode = "newest" | "oldest" | "az";
export type ViewMode = "grid" | "timeline";

interface FilterBarProps {
  selectedCategories: Set<string>;
  onToggleCategory: (cat: string) => void;
  selectedStatuses: Set<StatusKey>;
  onStatusesChange: (next: Set<StatusKey>) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  query: string;
  onQueryChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  totalCount: number;
}

export function FilterBar({
  selectedCategories,
  onToggleCategory,
  selectedStatuses,
  onStatusesChange,
  sortMode,
  onSortChange,
  query,
  onQueryChange,
  viewMode,
  onViewModeChange,
  totalCount,
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent || navigator.platform || "";
      setIsMac(/Mac|iPhone|iPad|iPod/i.test(ua));
    }
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const kbdLabel = isMac ? "⌘K" : "Ctrl K";

  // "All" status = every status enabled. Segmented control adds All alongside GA/Beta/Removed.
  const allStatusesActive = selectedStatuses.size === 3;
  const setAllStatuses = () => onStatusesChange(new Set(["GA", "Beta", "Removed"]));

  const activeChips: { key: string; label: string; onRemove: () => void; accent?: string }[] = [];
  selectedCategories.forEach((c) =>
    activeChips.push({
      key: "cat-" + c,
      label: c,
      accent: categoryAccentVar(c),
      onRemove: () => onToggleCategory(c),
    }),
  );
  (["GA", "Beta", "Removed"] as StatusKey[]).forEach((s) => {
    if (selectedStatuses.size < 3 && selectedStatuses.has(s)) {
      activeChips.push({
        key: "st-" + s,
        label: s,
        onRemove: () => {
          const next = new Set(selectedStatuses);
          next.delete(s);
          if (next.size === 0) onStatusesChange(new Set(["GA", "Beta", "Removed"]));
          else onStatusesChange(next);
        },
      });
    }
  });
  if (query.trim().length > 0) {
    activeChips.push({
      key: "q",
      label: `"${query.trim()}"`,
      onRemove: () => onQueryChange(""),
    });
  }

  const clearAll = () => {
    selectedCategories.forEach((c) => onToggleCategory(c));
    onStatusesChange(new Set(["GA", "Beta", "Removed"]));
    onQueryChange("");
  };

  return (
    <div className="sticky top-0 z-30 w-full border-y border-emerald/20 bg-ink/85 backdrop-blur-md sm:top-20 lg:top-24">
      <div className="container-atlas py-3 lg:py-4">
        <div className="flex items-center gap-3">
          {/* One canonical search input at every breakpoint. Keeping one DOM
              target makes Ctrl/Cmd-K, mobile focus, and anchored navigation
              land in the same place. */}
          <div className="relative min-w-0 flex-1 lg:min-w-[240px]">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cream/55"
              aria-hidden
            />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={`Search ${totalCount} features…`}
              aria-label={`Search ${totalCount} features`}
              className="h-11 border-emerald/30 bg-transparent pl-10 pr-3 font-sans text-sm text-cream placeholder:text-cream/55 md:border-emerald/25 md:bg-cream/[0.02] md:pr-14 md:text-[13px]"
            />
            <kbd
              aria-hidden
              className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-cream/15 bg-cream/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-cream/60 md:inline-flex"
            >
              {kbdLabel}
            </kbd>
          </div>

          <div className="md:hidden">
            <MobileFilterSheet
              selectedCategories={selectedCategories}
              onToggleCategory={onToggleCategory}
              selectedStatuses={selectedStatuses}
              onStatusesChange={onStatusesChange}
              sortMode={sortMode}
              onSortChange={onSortChange}
              query={query}
              onQueryChange={onQueryChange}
            />
          </div>

          {/* Desktop / tablet controls share the row with the same search. */}
          <div className="hidden min-w-0 items-center gap-3 md:flex">
            {/* Category dropdown — 18 glyph tiles inside a popover. */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Filter by category"
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-emerald/25 bg-cream/[0.02] px-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/80 transition-colors hover:border-emerald/50 hover:text-cream"
                >
                  Categories
                  {selectedCategories.size > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-gold/20 px-1.5 text-[10px] font-medium text-gold">
                      {selectedCategories.size}
                    </span>
                  )}
                  <ChevronDown className="size-3.5 opacity-70" aria-hidden />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[320px] border border-emerald/25 bg-ink p-3 text-cream"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/55">
                    Filter by category
                  </p>
                  {selectedCategories.size > 0 && (
                    <button
                      type="button"
                      onClick={() => selectedCategories.forEach((c) => onToggleCategory(c))}
                      aria-label="Clear selected categories"
                      className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/50 hover:text-gold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.map((cat) => {
                    const Glyph = iconForCategory(cat);
                    const active = selectedCategories.has(cat);
                    const accent = categoryAccentVar(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => onToggleCategory(cat)}
                        aria-pressed={active}
                        className={
                          "flex items-center gap-2 rounded-md border px-2 py-2 text-left font-mono text-[10.5px] uppercase tracking-[0.1em] transition-colors " +
                          (active
                            ? "border-emerald/50 bg-emerald/15 text-cream"
                            : "border-transparent text-cream/70 hover:border-emerald/30 hover:bg-cream/[0.03]")
                        }
                      >
                        <span
                          aria-hidden
                          className="inline-block size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: accent }}
                        />
                        <Glyph size={14} strokeWidth={1.4} aria-hidden style={{ color: accent }} />
                        <span className="truncate">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Status segmented control — All / GA / Beta / Removed. Selecting
              a single status narrows to it; All resets to every status. */}
            <div
              role="group"
              aria-label="Filter by status"
              className="flex h-11 shrink-0 items-center gap-0.5 rounded-md border border-emerald/25 bg-cream/[0.02] p-0.5"
            >
              <button
                type="button"
                onClick={setAllStatuses}
                aria-pressed={allStatusesActive}
                className={
                  "h-9 rounded-sm px-3 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors " +
                  (allStatusesActive
                    ? "bg-emerald/20 text-cream"
                    : "text-cream/70 hover:text-cream")
                }
              >
                All
              </button>
              {(["GA", "Beta", "Removed"] as StatusKey[]).map((s) => {
                const soloActive =
                  !allStatusesActive && selectedStatuses.has(s) && selectedStatuses.size === 1;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onStatusesChange(new Set<StatusKey>([s]))}
                    aria-pressed={soloActive}
                    className={
                      "h-9 rounded-sm px-3 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors " +
                      (soloActive ? "bg-emerald/20 text-cream" : "text-cream/70 hover:text-cream")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <Select value={sortMode} onValueChange={(v) => onSortChange(v as SortMode)}>
              <SelectTrigger
                aria-label="Sort features"
                className="h-11 w-[120px] shrink-0 border-emerald/25 bg-cream/[0.02] text-cream font-mono text-[11px] uppercase tracking-[0.14em] lg:w-[150px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-ink text-cream border-emerald/25 font-mono text-[11px] uppercase tracking-[0.14em]">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="az">A → Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View switch — Grid / Timeline / Constellation (constellation navigates). */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => {
                if (!v) return;
                if (v === "constellation") {
                  void navigate({ to: "/constellation" });
                  return;
                }
                if (v === "grid" || v === "timeline") onViewModeChange(v);
              }}
              className="h-11 shrink-0 items-center rounded-md border border-emerald/25 bg-cream/[0.02] p-0.5"
            >
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="h-9 gap-1.5 px-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-cream/70 data-[state=on]:bg-emerald/20 data-[state=on]:text-cream"
              >
                <Grid3x3 className="size-3.5" aria-hidden />
                <span className="hidden lg:inline">Grid</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="timeline"
                aria-label="Timeline view"
                className="h-9 gap-1.5 px-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-cream/70 data-[state=on]:bg-emerald/20 data-[state=on]:text-cream"
              >
                <LayoutList className="size-3.5" aria-hidden />
                <span className="hidden lg:inline">Timeline</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="constellation"
                aria-label="Constellation view"
                className="h-9 gap-1.5 px-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-cream/70 data-[state=on]:bg-emerald/20 data-[state=on]:text-cream"
              >
                <Sparkles className="size-3.5" aria-hidden />
                <span className="hidden lg:inline">Sky</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="mt-2.5 hidden flex-wrap items-center gap-1.5 md:flex">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="group inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/10 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-cream/85 transition-colors hover:border-gold/50 hover:bg-gold/10 hover:text-gold"
                aria-label={`Remove filter: ${chip.label}`}
              >
                {chip.accent && (
                  <span
                    aria-hidden
                    className="inline-block size-1.5 rounded-full"
                    style={{ backgroundColor: chip.accent }}
                  />
                )}
                <span>{chip.label}</span>
                <X
                  className="size-3 opacity-70 transition-transform group-hover:scale-110"
                  aria-hidden
                />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              aria-label="Clear all filters"
              className="ml-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-cream/50 hover:text-gold"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
