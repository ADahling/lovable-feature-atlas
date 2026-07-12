/**
 * Pixel-level visual regression for /constellation.
 *
 * Guards three region snapshots against palette/bloom/label drift:
 *   1. `sky-full`      — the entire viewport (stars + labels + hint pill)
 *   2. `sky-labels`    — the label band alone, to catch collisions/clipping
 *   3. `sky-hint`      — the bottom-right hint pill area (FAB clearance)
 *
 * Beta pulses and auto-rotate are gated on `!reduceMotion` in
 * ConstellationView, so `reducedMotion: "reduce"` yields a deterministic
 * frame. We additionally freeze `Date.now` / `performance.now` before load
 * so any time-driven initialization is stable across runs.
 *
 * Baselines live in `tests/__screenshots__/`. Delete a baseline (or set
 * `UPDATE_SNAPSHOTS=1`) and re-run to regenerate after an intentional
 * visual change.
 *
 * Run:    `bunx vitest run tests/constellation-visual-regression.test.ts`
 * Update: `UPDATE_SNAPSHOTS=1 bunx vitest run tests/constellation-visual-regression.test.ts`
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright-core";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const UPDATE = process.env.UPDATE_SNAPSHOTS === "1";
// The sky uses subtle canvas antialiasing; allow a small pixel budget.
const DIFF_TOLERANCE = 0.01; // 1%
const VIEWPORT = { width: 1440, height: 900 } as const;

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAP_DIR = join(__dirname, "__screenshots__");
if (!existsSync(SNAP_DIR)) mkdirSync(SNAP_DIR, { recursive: true });

function resolveExecutable(): string | undefined {
  const candidates = [
    "/chromium_headless_shell-1194/chrome-linux/headless_shell",
    "/chromium-1194/chrome-linux/chrome",
  ];
  for (const p of candidates) if (existsSync(p)) return p;
  return undefined;
}

// Regions to compare individually. Coordinates are in CSS pixels against the
// 1440x900 viewport and mirror the on-screen layout:
//   - labels band spans the vertical middle where category chips render
//   - hint pill sits bottom-right, clear of the Oracle FAB (bottom-8/right-8)
type Region = { name: string; clip: { x: number; y: number; width: number; height: number } };
const REGIONS: Region[] = [
  { name: "sky-full", clip: { x: 0, y: 0, width: 1440, height: 900 } },
  { name: "sky-labels", clip: { x: 200, y: 100, width: 1040, height: 620 } },
  { name: "sky-hint", clip: { x: 1080, y: 700, width: 340, height: 160 } },
];

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

async function captureRegions(): Promise<Record<string, Buffer>> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "dark",
  });
  // Freeze time before any app code runs so time-driven init is deterministic.
  await context.addInitScript(() => {
    const FROZEN = 1_700_000_000_000;
    const OriginalDate = Date;
    // Preserve constructor identity while pinning "now".
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).Date = class extends OriginalDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) super(FROZEN);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else super(...(args as any));
      }
      static now() { return FROZEN; }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).performance.now = () => 0;
  });
  const page = await context.newPage();
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
  const res = await page.goto(`${SITE_ORIGIN}/constellation`, {
    waitUntil: "networkidle",
    timeout: 45_000,
  });
  expect(res?.status(), `/constellation should 200`).toBe(200);
  await page.evaluate(() => (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts?.ready);
  // Let the sky settle: initial star arrivals, orbit framing, label layout.
  await page.waitForTimeout(4000);

  const out: Record<string, Buffer> = {};
  for (const region of REGIONS) {
    out[region.name] = await page.screenshot({
      clip: region.clip,
      animations: "disabled",
      caret: "hide",
    });
  }
  await context.close();
  return out;
}

describe("/constellation — visual regression", () => {
  it(
    "sky, labels, and hint pill match baselines",
    async () => {
      const shots = await captureRegions();
      const failures: string[] = [];

      for (const region of REGIONS) {
        const actualPng = shots[region.name];
        const baselinePath = join(SNAP_DIR, `constellation-${region.name}.png`);
        const diffPath = join(SNAP_DIR, `constellation-${region.name}-diff.png`);
        const actualPath = join(SNAP_DIR, `constellation-${region.name}-actual.png`);

        if (UPDATE || !existsSync(baselinePath)) {
          writeFileSync(baselinePath, actualPng);
          continue;
        }

        const baseline = PNG.sync.read(readFileSync(baselinePath));
        const actual = PNG.sync.read(actualPng);

        if (actual.width !== baseline.width || actual.height !== baseline.height) {
          writeFileSync(actualPath, actualPng);
          failures.push(
            `${region.name}: dimensions changed ` +
              `(baseline ${baseline.width}x${baseline.height}, actual ${actual.width}x${actual.height}). ` +
              `Delete baseline to accept.`,
          );
          continue;
        }

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
          failures.push(
            `${region.name}: ${numDiffPixels}/${total} px differ ` +
              `(${(ratio * 100).toFixed(3)}% > ${(DIFF_TOLERANCE * 100).toFixed(2)}%). ` +
              `See ${diffPath}`,
          );
        }
      }

      expect(failures, failures.join("\n")).toEqual([]);
    },
    90_000,
  );
});
