import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const viteConfig = readFileSync(
  fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
  "utf8",
);

describe("Windows Vite startup", () => {
  it("does not run the MCP route generator on Windows", () => {
    expect(viteConfig).toContain('process.platform === "win32" ? [] : [mcpPlugin()]');
    expect(viteConfig).toContain("plugins: mcpPlugins");
  });
});
