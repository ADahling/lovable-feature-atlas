/**
 * Pixel-level visual regression for /constellation.
 *
 * Guards region snapshots per breakpoint against palette/bloom/label drift
 * and against the mobile/tablet regressions we've fought before (nav
 * overlapping the tagline, category labels clipped by narrow viewports,
 * hint pill colliding with the legend/FAB).
 *
 * Breakpoints:
 *   - desktop  1440x900   full sky + label band + hint pill
 *   - tablet   768x1024   nav/tagline band + left/right label edges + hint
 *   - mobile   390x844    nav/tagline band + left/right label edges + hint
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
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const UPDATE = process.env.UPDATE_SNAPSHOTS === "1";
// The sky uses subtle canvas antialiasing; allow a small pixel budget.
const DIFF_TOLERANCE = 0.01; // 1%

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAP_DIR = join(__dirname, "__screenshots__");
const REPORT_DIR = join(__dirname, "__constellation_report__");
if (!existsSync(SNAP_DIR)) mkdirSync(SNAP_DIR, { recursive: true });

interface FailureEntry {
  key: string;
  breakpoint: string;
  region: string;
  reason: string;
  ratio: number | null;
  diffPixels: number | null;
  totalPixels: number | null;
  baselineFile: string;
  actualFile: string;
  diffFile: string | null;
}
const collectedFailures: FailureEntry[] = [];


function resolveExecutable(): string | undefined {
  const candidates = [
    "/chromium_headless_shell-1194/chrome-linux/headless_shell",
    "/chromium-1194/chrome-linux/chrome",
  ];
  for (const p of candidates) if (existsSync(p)) return p;
  return undefined;
}

type Region = { name: string; clip: { x: number; y: number; width: number; height: number } };
type Breakpoint = {
  name: "desktop" | "tablet" | "mobile";
  viewport: { width: number; height: number };
  regions: Region[];
};

// Regions target the seams we've had to defend:
//   - `sky-full`     the entire viewport (palette + bloom baseline)
//   - `nav-tagline`  top strip framing "BACK TO GRID" + centered tagline,
//                    the exact overlap zone that regressed at <=tablet widths
//   - `labels-*`     left + right edges of the label band (guards clipping of
//                    MCP CONNECTORS / MOBILE / APP CONNECTORS on narrow widths)
//   - `sky-labels`   desktop mid band, catches collision drift
//   - `hint`         hint pill, ensures Oracle FAB / legend clearance
const BREAKPOINTS: Breakpoint[] = [
  {
    name: "desktop",
    viewport: { width: 1440, height: 900 },
    regions: [
      { name: "sky-full", clip: { x: 0, y: 0, width: 1440, height: 900 } },
      { name: "nav-tagline", clip: { x: 0, y: 0, width: 1440, height: 96 } },
      { name: "sky-labels", clip: { x: 200, y: 100, width: 1040, height: 620 } },
      { name: "sky-hint", clip: { x: 1080, y: 700, width: 340, height: 160 } },
      // Full-width bottom band: legend (bottom-left) + hint pill (bottom-right).
      // Tall enough to catch either chrome creeping up into mid-canvas clusters.
      { name: "bottom-chrome", clip: { x: 0, y: 620, width: 1440, height: 280 } },
    ],
  },
  {
    name: "tablet",
    viewport: { width: 768, height: 1024 },
    regions: [
      { name: "sky-full", clip: { x: 0, y: 0, width: 768, height: 1024 } },
      { name: "nav-tagline", clip: { x: 0, y: 0, width: 768, height: 110 } },
      { name: "labels-left", clip: { x: 0, y: 120, width: 180, height: 780 } },
      { name: "labels-right", clip: { x: 588, y: 120, width: 180, height: 780 } },
      { name: "hint", clip: { x: 408, y: 864, width: 360, height: 160 } },
      { name: "bottom-chrome", clip: { x: 0, y: 744, width: 768, height: 280 } },
    ],
  },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
    regions: [
      { name: "sky-full", clip: { x: 0, y: 0, width: 390, height: 844 } },
      { name: "nav-tagline", clip: { x: 0, y: 0, width: 390, height: 128 } },
      { name: "labels-left", clip: { x: 0, y: 140, width: 120, height: 560 } },
      { name: "labels-right", clip: { x: 270, y: 140, width: 120, height: 560 } },
      { name: "hint", clip: { x: 0, y: 684, width: 390, height: 160 } },
      { name: "bottom-chrome", clip: { x: 0, y: 564, width: 390, height: 280 } },
    ],
  },
];

let browser: Browser;

beforeAll(async () => {
  // Fresh report dir per run so old failures never mislead the reviewer.
  if (existsSync(REPORT_DIR)) rmSync(REPORT_DIR, { recursive: true, force: true });
  mkdirSync(REPORT_DIR, { recursive: true });
  browser = await chromium.launch({
    headless: true,
    executablePath: resolveExecutable(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}, 60_000);

afterAll(async () => {
  await browser?.close();
  writeReport();
});

function writeReport() {
  if (collectedFailures.length === 0) {
    writeFileSync(
      join(REPORT_DIR, "index.html"),
      `<!doctype html><meta charset="utf-8"><title>Constellation VR — clean</title>
<body style="font:14px/1.5 system-ui;padding:32px;background:#0a0a0a;color:#fbf5e9">
<h1 style="color:#c9a961">No visual diffs</h1>
<p>All region baselines matched within ${(DIFF_TOLERANCE * 100).toFixed(2)}% tolerance.</p>
</body>`,
    );
    return;
  }
  const rows = collectedFailures
    .map((f) => {
      const stat =
        f.ratio !== null
          ? `${(f.ratio * 100).toFixed(3)}% (${f.diffPixels}/${f.totalPixels} px)`
          : f.reason;
      const diffCell = f.diffFile
        ? `<img src="./${f.diffFile}" loading="lazy" />`
        : `<div class="na">n/a</div>`;
      return `<tr>
  <td><code>${f.key}</code><br><span class="muted">${f.breakpoint} · ${f.region}</span><br><span class="stat">${stat}</span></td>
  <td><img src="./${f.baselineFile}" loading="lazy" /><div class="cap">baseline</div></td>
  <td><img src="./${f.actualFile}" loading="lazy" /><div class="cap">actual</div></td>
  <td>${diffCell}<div class="cap">diff</div></td>
</tr>`;
    })
    .join("\n");
  const html = `<!doctype html>
<meta charset="utf-8">
<title>Constellation VR — ${collectedFailures.length} diff${collectedFailures.length === 1 ? "" : "s"}</title>
<style>
  body{font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto;background:#0a0a0a;color:#fbf5e9;margin:0;padding:32px}
  h1{color:#c9a961;margin:0 0 4px;font-weight:600}
  .meta{color:#8a8a8a;margin-bottom:24px}
  table{border-collapse:separate;border-spacing:0 12px;width:100%}
  td{vertical-align:top;padding:12px;background:#141414;border:1px solid #262626}
  td:first-child{width:280px;background:#0f0f0f}
  img{max-width:360px;max-height:280px;display:block;border:1px solid #2a2a2a;background:#000}
  code{color:#c9a961;font:12px ui-monospace,SFMono-Regular,Menlo,monospace}
  .muted{color:#8a8a8a;font:11px ui-monospace,Menlo,monospace}
  .stat{color:#e4574c;font:12px ui-monospace,Menlo,monospace;display:inline-block;margin-top:6px}
  .cap{color:#8a8a8a;font:11px ui-monospace,Menlo,monospace;margin-top:4px}
  .na{color:#555;font:11px ui-monospace,Menlo,monospace;padding:24px;text-align:center;border:1px dashed #2a2a2a}
  .legend{margin:0 0 24px;color:#8a8a8a;font-size:12px}
  .legend b{color:#fbf5e9}
</style>
<body>
  <h1>Constellation visual regression — ${collectedFailures.length} diff${collectedFailures.length === 1 ? "" : "s"}</h1>
  <div class="meta">tolerance ${(DIFF_TOLERANCE * 100).toFixed(2)}% · generated ${new Date().toISOString()}</div>
  <p class="legend">
    <b>baseline</b> = committed snapshot · <b>actual</b> = this run · <b>diff</b> = red pixels changed.
    Accept intentional change: <code>UPDATE_SNAPSHOTS=1 bunx vitest run tests/constellation-visual-regression.test.ts</code>
  </p>
  <table>${rows}</table>
</body>`;
  writeFileSync(join(REPORT_DIR, "index.html"), html);
  console.log(
    `[constellation-vr] report: ${relative(process.cwd(), join(REPORT_DIR, "index.html"))} ` +
      `(${collectedFailures.length} diff${collectedFailures.length === 1 ? "" : "s"})`,
  );
}


async function captureRegions(bp: Breakpoint): Promise<Record<string, Buffer>> {
  const context = await browser.newContext({
    viewport: bp.viewport,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "dark",
  });
  // Freeze time before any app code runs so time-driven init is deterministic.
  await context.addInitScript(() => {
    const FROZEN = 1_700_000_000_000;
    const OriginalDate = Date;
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
  for (const region of bp.regions) {
    out[region.name] = await page.screenshot({
      clip: region.clip,
      animations: "disabled",
      caret: "hide",
    });
  }
  await context.close();
  return out;
}

describe("/constellation, visual regression", () => {
  for (const bp of BREAKPOINTS) {
    it(
      `${bp.name} (${bp.viewport.width}x${bp.viewport.height}) matches baselines`,
      async () => {
        const shots = await captureRegions(bp);
        const failures: string[] = [];

        for (const region of bp.regions) {
          const key = `constellation-${bp.name}-${region.name}`;
          const actualPng = shots[region.name];
          const baselinePath = join(SNAP_DIR, `${key}.png`);
          const diffPath = join(SNAP_DIR, `${key}-diff.png`);
          const actualPath = join(SNAP_DIR, `${key}-actual.png`);

          if (UPDATE || !existsSync(baselinePath)) {
            writeFileSync(baselinePath, actualPng);
            continue;
          }

          const baseline = PNG.sync.read(readFileSync(baselinePath));
          const actual = PNG.sync.read(actualPng);

          if (actual.width !== baseline.width || actual.height !== baseline.height) {
            writeFileSync(actualPath, actualPng);
            failures.push(
              `${key}: dimensions changed ` +
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
              `${key}: ${numDiffPixels}/${total} px differ ` +
                `(${(ratio * 100).toFixed(3)}% > ${(DIFF_TOLERANCE * 100).toFixed(2)}%). ` +
                `See ${diffPath}`,
            );
          }
        }

        expect(failures, failures.join("\n")).toEqual([]);
      },
      120_000,
    );
  }
});
