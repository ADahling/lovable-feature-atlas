import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { features } from "../../data/features";
import { Input } from "../ui/input";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const CATEGORIES = Array.from(new Set(features.map((f) => f.category)));

export type StatusKey = "GA" | "Beta" | "Removed";
export type SortMode = "newest" | "oldest" | "az";

interface FilterBarProps {
  selectedCategories: Set<string>;
  onToggleCategory: (cat: string) => void;
  selectedStatuses: Set<StatusKey>;
  onStatusesChange: (next: Set<StatusKey>) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  query: string;
  onQueryChange: (q: string) => void;
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
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="sticky top-0 z-30 w-full border-b border-emerald/20 bg-ink/80 backdrop-blur-md"
    >
      <div className="container-atlas section-y-sm lg:pr-52 xl:pr-56">

        {/* Category pills row */}
        <div className="flex items-start gap-3">
          <div className="relative flex-1 min-w-0 md:overflow-visible">
            <div
              className="flex gap-2 overflow-x-auto snap-x pb-3 -mx-6 px-6 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 md:flex-wrap md:overflow-visible md:pb-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:contain]"
            >
              {CATEGORIES.map((cat) => {
                const active = selectedCategories.has(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onToggleCategory(cat)}
                    aria-pressed={active}
                    aria-label={`Filter by ${cat}`}
                    className={
                      "snap-start shrink-0 whitespace-nowrap inline-flex items-center min-h-11 md:min-h-0 rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors " +
                      (active
                        ? "bg-emerald text-cream border-emerald"
                        : "border-emerald/30 text-cream/70 hover:text-cream hover:border-emerald")
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            {/* Right-edge fade cue — mobile only */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 bottom-3 w-10 bg-gradient-to-l from-ink to-transparent md:hidden"
            />
          </div>
          {(selectedCategories.size > 0 || query.length > 0 || selectedStatuses.size < 3) && (
            <button
              type="button"
              onClick={() => {
                selectedCategories.forEach((c) => onToggleCategory(c));
                onStatusesChange(new Set(["GA", "Beta", "Removed"] as StatusKey[]));
                onQueryChange("");
              }}
              className="shrink-0 hidden md:inline-flex font-mono text-[11px] uppercase tracking-wider text-cream/60 hover:text-emerald transition-colors py-2"
            >
              Clear all ×
            </button>
          )}
        </div>

        {/* Controls row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <span
              aria-hidden
              className="hidden md:inline-flex font-mono text-[10px] uppercase tracking-[0.22em] text-cream/40"
            >
              Status
            </span>
            <span aria-hidden className="hidden md:inline-block h-4 w-px bg-cream/15" />
            <ToggleGroup
              type="multiple"
              value={Array.from(selectedStatuses)}
              onValueChange={(vals: string[]) =>
                onStatusesChange(new Set(vals as StatusKey[]))
              }
              className="justify-start rounded-full border border-cream/10 bg-cream/[0.02] p-0.5"
            >
              {(["GA", "Beta", "Removed"] as StatusKey[]).map((s) => (
                <ToggleGroupItem
                  key={s}
                  value={s}
                  aria-label={s}
                  className="font-mono text-xs uppercase tracking-wider text-cream/70 data-[state=on]:bg-emerald/20 data-[state=on]:text-cream"
                >
                  {s}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
            <Select value={sortMode} onValueChange={(v) => onSortChange(v as SortMode)}>
              <SelectTrigger
                aria-label="Sort features"
                className="w-full md:w-[180px] border-emerald/30 bg-transparent text-cream font-mono text-xs uppercase tracking-wider"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-ink text-cream border-emerald/30 font-mono text-xs uppercase tracking-wider">
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="az">A → Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full md:w-[260px]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cream/50"
                aria-hidden
              />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search features"
                aria-label="Search features"
                className="border-emerald/30 bg-transparent pl-9 pr-14 text-cream placeholder:text-cream/40 font-sans text-sm"
              />
              <span
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-cream/35 hidden lg:block"
                aria-hidden
              >
                ⌘K
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
