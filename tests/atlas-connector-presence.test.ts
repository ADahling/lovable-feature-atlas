/**
 * Guards that key App Connector entries stay in the atlas dataset.
 *
 * Regression check: when Mapbox was added on 2026-07-14, we needed
 * assurance that the addition did not accidentally drop the earlier
 * X Connector or GitHub Connector entries.
 *
 * Run: `bunx vitest run tests/atlas-connector-presence.test.ts`
 */

import { describe, it, expect } from "vitest";
import { features } from "../src/data/features";

const REQUIRED_IDS = ["mapbox-connector", "x-connector", "github-connector"] as const;

describe("atlas connector presence", () => {
  it.each(REQUIRED_IDS)("includes %s in src/data/features.ts", (id) => {
    const match = features.find((f) => f.id === id);
    expect(match, `feature id "${id}" is missing from the atlas dataset`).toBeDefined();
    expect(match!.category).toBe("App Connectors");
    expect(["GA", "Beta"]).toContain(match!.status);
    expect(match!.releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("mapbox-connector has the expected release date and status", () => {
    const mapbox = features.find((f) => f.id === "mapbox-connector")!;
    expect(mapbox.releaseDate).toBe("2026-07-14");
    expect(mapbox.status).toBe("GA");
    expect(mapbox.name).toMatch(/mapbox/i);
  });

  it("does not duplicate any of the required connector ids", () => {
    for (const id of REQUIRED_IDS) {
      const count = features.filter((f) => f.id === id).length;
      expect(count, `duplicate entries for "${id}"`).toBe(1);
    }
  });
});
