/**
 * Pixel-level visual regression for the four surfaces most prone to
 * layout shift: Hero, FeatureCard, TimelineView, and Quiz.
 *
 * Breakpoints:
 *   - mobile      390 x 844
 *   - tablet      768 x 1024
 *   - desktop    1440 x 900
 *   - ultrawide  2560 x 1080
 *
 * We snapshot element clips (via locator.screenshot) instead of full
 * viewports so an unrelated change further down the page never causes
 * a false positive on Hero/Card/Timeline/Quiz.
 *
 * Determinism: reducedMotion=reduce, Date/performance frozen,
 * animations/transitions zeroed, thematic loader pre-dismissed via
 * sessionStorage, fonts.ready awaited.
 *
 * Baselines live in tests/__screenshots__/layout-*.png. Run with
 * UPDATE_SNAPSHOTS=1 to regenerate after an intentional visual change.
 *
 * Run:    bunx vitest run tests/layout-visual-regression.test.ts
 * Update: UPDATE_SNAPSHOTS=1 bunx vitest run tests/layout-visual-regression.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser, type Page } from "playwright-core";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";
const UPDATE = process.env.UPDATE_SNAPSHOTS === "1";
const DIFF_TOLERANCE = 0.01; // 1% of pixels

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAP_DIR = join(__dirname, "__screenshots__");
const REPORT_DIR = join(__dirname, "__layout_report__");
if (!existsSync(SNAP_DIR)) mkdirSync(SNAP_DIR, { recursive: true });

function resolveExecutable(): string | undefined {
  const candidates = [
    "/chromium_headless_shell-1194/chrome-linux/headless_shell",
    "/chromium-1194/chrome-linux/chrome",
  ];
  for (const p of candidates) if (existsSync(p)) return p;
  return undefined;
}

type Breakpoint = {
  name: "mobile" | "tablet" | "desktop" | "ultrawide";
  viewport: { width: number; height: number };
};

const BREAKPOINTS: Breakpoint[] = [
  { name: "mobile", viewport: { width: 390, height: 844 } },
  { name: "tablet", viewport: { width: 768, height: 1024 } },
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "ultrawide", viewport: { width: 2560, height: 1080 } },
];

type Target = {
  name: "hero" | "feature-card" | "timeline" | "quiz";
  path: string;
  selector: string;
};

const TARGETS: Target[] = [
  { name: "hero", path: "/", selector: "[data-atlas-hero-canvas]" },
  { name: "feature-card", path: "/", selector: "[data-atlas-feature-card]" },
  { name: "timeline", path: "/?view=timeline", selector: "[data-atlas-timeline]" },
  { name: "quiz", path: "/quiz", selector: "main" },
];

interface FailureEntry {
  key: string;
  breakpoint: string;
  target: string;
  reason: string;
  ratio: number | null;
  diffPixels: number | null;
  totalPixels: number | null;
  baselineFile: string;
  actualFile: string;
  diffFile: string | null;
}
const collectedFailures: FailureEntry[] = [];

let browser: Browser;

beforeAll(async () => {
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
      `<!doctype html><meta charset="utf-8"><title>Layout VR — clean</title>
<body style="font:14px/1.5 system-ui;padding:32px;background:#0a0a0a;color:#fbf5e9">
<h1 style="color:#c9a961">No visual diffs</h1>
<p>All baselines matched within ${(DIFF_TOLERANCE * 100).toFixed(2)}% tolerance.</p>
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
  <td><code>${f.key}</code><br><span class="muted">${f.breakpoint} · ${f.target}</span><br><span class="stat">${stat}</span></td>
  <td><img src="./${f.baselineFile}" loading="lazy" /><div class="cap">baseline</div></td>
  <td><img src="./${f.actualFile}" loading="lazy" /><div class="cap">actual</div></td>
  <td>${diffCell}<div class="cap">diff</div></td>
</tr>`;
    })
    .join("\n");
  writeFileSync(
    join(REPORT_DIR, "index.html"),
    `<!doctype html>
<meta charset="utf-8">
<title>Layout VR — ${collectedFailures.length} diff${collectedFailures.length === 1 ? "" : "s"}</title>
<style>
  body{font:14px/1.5 system-ui;background:#0a0a0a;color:#fbf5e9;margin:0;padding:32px}
  h1{color:#c9a961;margin:0 0 4px;font-weight:600}
  .meta{color:#8a8a8a;margin-bottom:24px}
  table{border-collapse:separate;border-spacing:0 12px;width:100%}
  td{vertical-align:top;padding:12px;background:#141414;border:1px solid #262626}
  td:first-child{width:280px;background:#0f0f0f}
  img{max-width:420px;max-height:320px;display:block;border:1px solid #2a2a2a;background:#000}
  code{color:#c9a961;font:12px ui-monospace,Menlo,monospace}
  .muted{color:#8a8a8a;font:11px ui-monospace,Menlo,monospace}
  .stat{color:#e4574c;font:12px ui-monospace,Menlo,monospace;display:inline-block;margin-top:6px}
  .cap{color:#8a8a8a;font:11px ui-monospace,Menlo,monospace;margin-top:4px}
  .na{color:#555;font:11px ui-monospace,Menlo,monospace;padding:24px;text-align:center;border:1px dashed #2a2a2a}
</style>
<body>
  <h1>Layout visual regression — ${collectedFailures.length} diff${collectedFailures.length === 1 ? "" : "s"}</h1>
  <div class="meta">tolerance ${(DIFF_TOLERANCE * 100).toFixed(2)}% · generated ${new Date().toISOString()}</div>
  <p style="color:#8a8a8a;font-size:12px;margin:0 0 24px">
    Accept intentional change: <code>UPDATE_SNAPSHOTS=1 bunx vitest run tests/layout-visual-regression.test.ts</code>
  </p>
  <table>${rows}</table>
</body>`,
  );
  console.log(
    `[layout-vr] report: ${relative(process.cwd(), join(REPORT_DIR, "index.html"))} ` +
      `(${collectedFailures.length} diff${collectedFailures.length === 1 ? "" : "s"})`,
  );
}

async function preparePage(bp: Breakpoint): Promise<Page> {
  const context = await browser.newContext({
    viewport: bp.viewport,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "light",
  });
  await context.addInitScript(() => {
    const FROZEN = 1_700_000_000_000;
    const OriginalDate = Date;
    (globalThis as any).Date = class extends OriginalDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) super(FROZEN);
        else super(...(args as any));
      }
      static now() {
        return FROZEN;
      }
    };
    (globalThis as any).performance.now = () => 0;
  });
  return context.newPage();
}

const deterministicStyles = `
      *, *::before, *::after {
        animation-duration: 0ms !important;
        animation-delay: 0ms !important;
        transition-duration: 0ms !important;
        transition-delay: 0ms !important;
        caret-color: transparent !important;
      }
      /* Force content-visibility:auto chunks to lay out for deterministic
         element screenshots. Without this, off-screen cards report a zero
         bounding box until scrolled + repainted, which flakes captures. */
      [data-atlas-feature-card], [data-atlas-timeline] {
        content-visibility: visible !important;
        contain-intrinsic-size: auto !important;
      }
      /* Framer-motion sets inline opacity:0 / transform on grid cards until
         they enter the viewport; force them visible for element screenshots. */
      [data-fg-key], [data-atlas-feature-card] {
        opacity: 1 !important;
        transform: none !important;
        visibility: visible !important;
      }
      [data-atlas-timeline] button {
        opacity: 1 !important;
        transform: none !important;
        visibility: visible !important;
      }
    `;

async function capture(target: Target, bp: Breakpoint): Promise<Buffer> {
  const page = await preparePage(bp);
  const url = `${SITE_ORIGIN}${target.path}`;
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
  expect(res?.status(), `${target.path} should 200`).toBe(200);
  // addStyleTag only affects the current document. Install the deterministic
  // overrides after navigation so they survive the about:blank -> app load.
  await page.addStyleTag({ content: deterministicStyles });
  await page.evaluate(
    () => (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts?.ready,
  );
  const locator = page.locator(target.selector).first();
  // Scroll the whole page to force below-the-fold lazy chunks (grid cards,
  // timeline groups) to mount before we wait for the selector.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await locator.waitFor({ state: "attached", timeout: 30_000 });
  // Pick the first match with real layout. On mobile the masonry grid can
  // place `[data-atlas-feature-card]` in a 0-width column; that element is
  // attached and painted but its bbox is 0 wide, which used to flake capture.
  await page.waitForFunction(
    (sel) => {
      const els = [...document.querySelectorAll(sel)] as HTMLElement[];
      return els.some((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
    },
    target.selector,
    { timeout: 30_000 },
  );
  await page.evaluate((sel) => {
    const els = [...document.querySelectorAll(sel)] as HTMLElement[];
    const el = els.find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    el?.scrollIntoView({ block: "center", inline: "center" });
  }, target.selector);
  // Settle: layout, 3D bootstrap, image decode.
  await page.waitForTimeout(1500);
  // Screenshot via page.clip using measured bbox — sidesteps Playwright's
  // stability/visibility gate, which flakes on `contentVisibility: auto`
  // + framer-motion `whileInView` cards even when they are laid out.
  const box = await page.evaluate((sel) => {
    const els = [...document.querySelectorAll(sel)] as HTMLElement[];
    const el = els.find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  }, target.selector);

  if (!box || box.width < 1 || box.height < 1) {
    throw new Error(`no bounding box for ${target.selector} @ ${bp.name}`);
  }
  const clip = {
    x: Math.max(0, Math.floor(box.x)),
    y: Math.max(0, Math.floor(box.y)),
    width: Math.max(1, Math.min(bp.viewport.width - Math.floor(box.x), Math.ceil(box.width))),
    height: Math.max(1, Math.min(bp.viewport.height - Math.floor(box.y), Math.ceil(box.height))),
  };
  const buf = await page.screenshot({ clip, animations: "disabled", caret: "hide" });
  await page.context().close();
  return buf;
}

describe("Hero / FeatureCard / TimelineView / Quiz, visual regression", () => {
  for (const bp of BREAKPOINTS) {
    for (const target of TARGETS) {
      it(`${target.name} @ ${bp.name} (${bp.viewport.width}x${bp.viewport.height})`, async () => {
        const actualPng = await capture(target, bp);
        const key = `layout-${target.name}-${bp.name}`;
        const baselinePath = join(SNAP_DIR, `${key}.png`);
        const diffPath = join(SNAP_DIR, `${key}-diff.png`);
        const actualPath = join(SNAP_DIR, `${key}-actual.png`);

        if (UPDATE || !existsSync(baselinePath)) {
          writeFileSync(baselinePath, actualPng);
          return;
        }

        const baseline = PNG.sync.read(readFileSync(baselinePath));
        const actual = PNG.sync.read(actualPng);
        const reportBaseline = `${key}-baseline.png`;
        const reportActual = `${key}-actual.png`;
        const reportDiff = `${key}-diff.png`;

        const recordFailure = (
          reason: string,
          wroteDiff: boolean,
          ratio: number | null,
          diffPixels: number | null,
          totalPixels: number | null,
        ) => {
          copyFileSync(baselinePath, join(REPORT_DIR, reportBaseline));
          writeFileSync(join(REPORT_DIR, reportActual), actualPng);
          collectedFailures.push({
            key,
            breakpoint: bp.name,
            target: target.name,
            reason,
            ratio,
            diffPixels,
            totalPixels,
            baselineFile: reportBaseline,
            actualFile: reportActual,
            diffFile: wroteDiff ? reportDiff : null,
          });
        };

        if (actual.width !== baseline.width || actual.height !== baseline.height) {
          writeFileSync(actualPath, actualPng);
          const reason =
            `dimensions changed (baseline ${baseline.width}x${baseline.height}, ` +
            `actual ${actual.width}x${actual.height}). Delete baseline to accept.`;
          recordFailure(reason, false, null, null, null);
          throw new Error(`${key}: ${reason}`);
        }

        const { width, height } = baseline;
        const diff = new PNG({ width, height });
        const numDiffPixels = pixelmatch(baseline.data, actual.data, diff.data, width, height, {
          threshold: 0.1,
          includeAA: false,
        });
        const total = width * height;
        const ratio = numDiffPixels / total;
        if (ratio > DIFF_TOLERANCE) {
          const diffPng = PNG.sync.write(diff);
          writeFileSync(diffPath, diffPng);
          writeFileSync(actualPath, actualPng);
          writeFileSync(join(REPORT_DIR, reportDiff), diffPng);
          recordFailure(
            `${(ratio * 100).toFixed(3)}% > ${(DIFF_TOLERANCE * 100).toFixed(2)}%`,
            true,
            ratio,
            numDiffPixels,
            total,
          );
          throw new Error(
            `${key}: ${numDiffPixels}/${total} px differ ` +
              `(${(ratio * 100).toFixed(3)}% > ${(DIFF_TOLERANCE * 100).toFixed(2)}%). ` +
              `See report: tests/__layout_report__/index.html`,
          );
        }
      }, 120_000);
    }
  }
});
