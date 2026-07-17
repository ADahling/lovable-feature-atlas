import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const statusSource = readFileSync(
  fileURLToPath(new URL("../src/routes/status.tsx", import.meta.url)),
  "utf8",
);

describe("status feature count", () => {
  it("derives the live count from the root feature dataset", () => {
    expect(statusSource).toContain("const { features } = useFeatures()");
    expect(statusSource).toContain("value={features.length.toLocaleString()}");
    expect(statusSource).not.toMatch(/value=["']328["']/);
  });
});
