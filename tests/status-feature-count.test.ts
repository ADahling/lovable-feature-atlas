import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const statusSource = readFileSync(
  fileURLToPath(new URL("../src/routes/status.tsx", import.meta.url)),
  "utf8",
);

describe("status feature count", () => {
  it("derives the live count from the route-scoped catalog summary", () => {
    expect(statusSource).toContain("loader: () => getCatalogSummary()");
    expect(statusSource).toContain("const summary = Route.useLoaderData()");
    expect(statusSource).toContain("value={summary.total.toLocaleString()}");
    expect(statusSource).not.toMatch(/value=["']328["']/);
  });
});
