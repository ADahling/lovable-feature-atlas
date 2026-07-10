import type { StatusKey, SortMode, ViewMode } from "../components/atlas/FilterBar";

/**
 * Onboarding presets — first-visit guidance path. Each preset either applies
 * a filter state to the catalog or navigates to a dedicated route
 * (the "untried" preset defers to /quiz which already tracks used features).
 */

export type PresetId = "today" | "recent" | "team" | "compare" | "untried";

export type Recency = "" | "30d";

export interface PresetFilterState {
  categories: string[];
  statuses: StatusKey[];
  sort: SortMode;
  query: string;
  view: ViewMode;
  recency: Recency;
}

export interface PresetDef {
  id: PresetId;
  label: string;
  hint: string;
  applies?: PresetFilterState;
  navTo?: string;
}

const ALL_STATUSES: StatusKey[] = ["GA", "Beta", "Removed"];

export const PRESETS: readonly PresetDef[] = [
  {
    id: "today",
    label: "What can Lovable do today?",
    hint: "Every generally-available feature, newest first.",
    applies: {
      categories: [],
      statuses: ["GA"],
      sort: "newest",
      query: "",
      view: "grid",
      recency: "",
    },
  },
  {
    id: "recent",
    label: "What changed recently?",
    hint: "Everything shipped in the last 30 days.",
    applies: {
      categories: [],
      statuses: [...ALL_STATUSES],
      sort: "newest",
      query: "",
      view: "grid",
      recency: "30d",
    },
  },
  {
    id: "team",
    label: "Is Lovable ready for my team?",
    hint: "Security, Platform, and Workspace — GA only.",
    applies: {
      categories: ["Security", "Platform", "Workspace"],
      statuses: ["GA"],
      sort: "newest",
      query: "",
      view: "grid",
      recency: "",
    },
  },
  {
    id: "untried",
    label: "Show me features I've never tried",
    hint: "Runs the quiz — it already tracks what you've used.",
    navTo: "/quiz",
  },
  {
    id: "compare",
    label: "Compare GA and Beta capabilities",
    hint: "GA and Beta laid out on the timeline.",
    applies: {
      categories: [],
      statuses: ["GA", "Beta"],
      sort: "newest",
      query: "",
      view: "timeline",
      recency: "",
    },
  },
] as const;

export const PRESET_TITLES: Record<Exclude<PresetId, "untried">, string> = {
  today: "What Lovable can do today",
  recent: "What changed recently",
  team: "Is Lovable ready for my team",
  compare: "Compare GA and Beta capabilities",
};

export function presetById(id: string): PresetDef | undefined {
  return PRESETS.find((p) => p.id === id);
}
