/**
 * Pixel-level visual regression for /features/$slug pages.
 *
 * Renders each representative feature page in headless Chromium at a fixed
 * viewport and compares the screenshot against a committed baseline PNG.
 * A pixel diff above the tolerance fails the test and writes a `-diff.png`
 * next to the baseline for inspection.
 *
 * Baselines live in `tests/__screenshots__/`. Delete a baseline (or set
 * `UPDATE_SNAPSHOTS=1`) and re-run to regenerate after an intentional
 * visual change.
 *
 * Run:    `bunx vitest run tests/feature-visual-regression.test.ts`
 * Update: `UPDATE_SNAPSHOTS=1 bunx vitest run tests/feature-visual-regression.test.ts`
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright-core";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";
import { features } from "../src/data/features";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const UPDATE = process.env.UPDATE_SNAPSHOTS === "1";
// Fraction of pixels allowed to differ. Small buffer for font antialiasing.
const DIFF_TOLERANCE = 0.005; // 0.5%

// Every feature slug gets its own screenshot + baseline. Set
// FEATURE_SAMPLE=N locally to render only the first N for a fast smoke run;
// CI leaves it unset so the full catalog is checked on every PR.
const SAMPLE = Number(process.env.FEATURE_SAMPLE ?? "0");
const ALL_SLUGS = features.map((f) => f.id);
const SLUGS = SAMPLE > 0 ? ALL_SLUGS.slice(0, SAMPLE) : ALL_SLUGS;
const VIEWPORT = { width: 1280, height: 1800 } as const;

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAP_DIR = join(__dirname, "__screenshots__");
if (!existsSync(SNAP_DIR)) mkdirSync(SNAP_DIR, { recursive: true });

// Resolve a Chromium binary. Prefer Playwright's discovery, fall back to the
// headless_shell shipped in the sandbox at a known nix path.
function resolveExecutable(): string | undefined {
  const candidates = [
    "/chromium_headless_shell-1194/chrome-linux/headless_shell",
    "/chromium-1194/chrome-linux/chrome",
  ];
  for (const p of candidates) if (existsSync(p)) return p;
  return undefined;
}

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch({
    headless: true,
    executablePath: resolveExecutable(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function screenshotPage(slug: string): Promise<Buffer> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    // Force reduced motion + disable animations so screenshots are stable.
    reducedMotion: "reduce",
    colorScheme: "dark",
  });
  const page = await context.newPage();
  // Neutralize animations and blinking carets that would otherwise churn
  // pixel diffs turn to turn.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0ms !important;
        animation-delay: 0ms !important;
        transition-duration: 0ms !important;
        transition-delay: 0ms !important;
        caret-color: transparent !important;
      }
    `,
  }).catch(() => {});
  const res = await page.goto(`${SITE_ORIGIN}/features/${slug}`, {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  expect(res?.status(), `/features/${slug} should 200`).toBe(200);
  // Ensure fonts are loaded before snapping — otherwise FOUT wrecks the diff.
  await page.evaluate(() => (document as any).fonts?.ready);
  const png = await page.screenshot({
    fullPage: false,
    animations: "disabled",
    caret: "hide",
  });
  await context.close();
  return png;
}

describe("feature detail — visual regression", () => {
  it.each(SLUGS)(
    "%s matches baseline screenshot",
    async (slug) => {
      const actualPng = await screenshotPage(slug);
      const baselinePath = join(SNAP_DIR, `feature-${slug}.png`);
      const diffPath = join(SNAP_DIR, `feature-${slug}-diff.png`);
      const actualPath = join(SNAP_DIR, `feature-${slug}-actual.png`);

      if (UPDATE || !existsSync(baselinePath)) {
        writeFileSync(baselinePath, actualPng);
        // On first run / update run we accept the current render as truth.
        expect(existsSync(baselinePath)).toBe(true);
        return;
      }

      const baseline = PNG.sync.read(readFileSync(baselinePath));
      const actual = PNG.sync.read(actualPng);

      // If dimensions drift, that itself is a regression — layout collapsed
      // or grew. Fail hard with a clear message.
      expect(
        { w: actual.width, h: actual.height },
        `dimensions changed for ${slug}; delete baseline to accept`,
      ).toEqual({ w: baseline.width, h: baseline.height });

      const { width, height } = baseline;
      const diff = new PNG({ width, height });
      const numDiffPixels = pixelmatch(
        baseline.data,
        actual.data,
        diff.data,
        width,
        height,
        { threshold: 0.1, includeAA: false },
      );

      const total = width * height;
      const ratio = numDiffPixels / total;

      if (ratio > DIFF_TOLERANCE) {
        writeFileSync(diffPath, PNG.sync.write(diff));
        writeFileSync(actualPath, actualPng);
      }

      expect(
        ratio,
        `visual regression on /features/${slug}: ${numDiffPixels}/${total} px differ ` +
          `(${(ratio * 100).toFixed(3)}% > ${(DIFF_TOLERANCE * 100).toFixed(2)}%). ` +
          `See ${diffPath}`,
      ).toBeLessThanOrEqual(DIFF_TOLERANCE);
    },
    60_000,
  );
});
