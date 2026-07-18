import type { SortMode, StatusKey, ViewMode } from "../components/atlas/FilterBar";
import { presetById, type Recency } from "./atlas-presets";

export interface HomePresetState {
  categories: Set<string>;
  statuses: Set<StatusKey>;
  sort: SortMode;
  query: string;
  view: ViewMode;
  recency: Recency;
  preset: string;
}

export function resolveHomePresetState(state: HomePresetState): HomePresetState {
  const preset = presetById(state.preset);
  const hasExplicitFilter =
    state.categories.size > 0 ||
    state.statuses.size !== 3 ||
    state.sort !== "newest" ||
    state.query !== "" ||
    state.view !== "grid" ||
    state.recency !== "";

  if (!preset?.applies || hasExplicitFilter) return state;

  return {
    categories: new Set(preset.applies.categories),
    statuses: new Set(preset.applies.statuses),
    sort: preset.applies.sort,
    query: preset.applies.query,
    view: preset.applies.view,
    recency: preset.applies.recency,
    preset: preset.id,
  };
}
