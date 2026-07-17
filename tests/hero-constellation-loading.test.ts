import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const heroSource = readFileSync(
  fileURLToPath(new URL("../src/components/atlas/Hero.tsx", import.meta.url)),
  "utf8",
);
const sheetSource = readFileSync(
  fileURLToPath(new URL("../src/components/ui/sheet.tsx", import.meta.url)),
  "utf8",
);

describe("homepage constellation loading", () => {
  it("keeps the desktop constellation out of the critical hydration path", () => {
    expect(heroSource).toMatch(/lazy\(\(\)\s*=>\s*import\("\.\/HeroConstellation"\)/);
    expect(heroSource).not.toMatch(
      /import\s+\{\s*HeroConstellation\s*\}\s+from\s+["']\.\/HeroConstellation["']/,
    );
    expect(heroSource).toContain("requestIdleCallback");
    expect(heroSource).toContain("window.setTimeout(revealConstellation, 250)");
    expect(heroSource).toContain("<Suspense fallback={null}>");
  });

  it("does not advertise interactions before the constellation is ready", () => {
    expect(heroSource).toMatch(
      /isDesktop\s*&&\s*!isTouch\s*&&\s*!hintDismissed\s*&&\s*mounted\s*&&\s*constellationReady/,
    );
  });

  it("renders only the custom close control in the star preview", () => {
    expect(heroSource).toMatch(/<SheetContent[\s\S]*?hideCloseButton/);
    expect(sheetSource).toContain("hideCloseButton?: boolean");
    expect(sheetSource).toContain("{!hideCloseButton && (");
  });
});
