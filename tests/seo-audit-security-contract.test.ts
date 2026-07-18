import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const auditSource = readFileSync(resolve(root, "src/lib/seo-audit.functions.ts"), "utf8");

describe("SEO audit security contract", () => {
  it("pins every outbound audit request to the canonical site origin", () => {
    expect(auditSource).toContain("const base = SITE_ORIGIN;");
    expect(auditSource).not.toContain("getRequest");
    expect(auditSource).not.toMatch(/new URL\(.*request.*url.*\)\.origin/i);
    expect(auditSource).not.toMatch(/new URL\(.*req.*url.*\)\.origin/i);
  });
});
