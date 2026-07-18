import { describe, expect, it } from "vitest";
import { resolveHomePresetState } from "../src/lib/home-preset";

const defaultState = {
  categories: new Set<string>(),
  statuses: new Set(["GA", "Beta", "Removed"] as const),
  sort: "newest",
  query: "",
  view: "grid",
  recency: "",
  preset: "",
} as const;

describe("homepage preset state", () => {
  it("resolves a cold preset URL before the first render", () => {
    const state = resolveHomePresetState({ ...defaultState, preset: "team" });

    expect(Array.from(state.categories)).toEqual(["Security", "Platform", "Workspace"]);
    expect(Array.from(state.statuses)).toEqual(["GA"]);
    expect(state.preset).toBe("team");
  });

  it("keeps explicit URL filters authoritative when a preset label is present", () => {
    const state = resolveHomePresetState({
      ...defaultState,
      categories: new Set(["Editor"]),
      statuses: new Set(["Beta"] as const),
      preset: "team",
    });

    expect(Array.from(state.categories)).toEqual(["Editor"]);
    expect(Array.from(state.statuses)).toEqual(["Beta"]);
    expect(state.preset).toBe("team");
  });
});
