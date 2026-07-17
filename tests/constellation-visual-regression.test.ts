/**
 * Cross-platform layout and render checks for the WebGL constellation.
 * These assertions catch blank canvases, clipped controls, overlap, and
 * viewport overflow without tying CI to operating-system font rasterization.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright-core";
import { existsSync } from "node:fs";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const BREAKPOINTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "tablet", viewport: { width: 768, height: 1024 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
] as const;

function resolveExecutable(): string | undefined {
  const candidates = [
    "/chromium_headless_shell-1194/chrome-linux/headless_shell",
    "/chromium-1194/chrome-linux/chrome",
  ];
  return candidates.find((candidate) => existsSync(candidate));
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
}, 60_000);

describe("constellation rendering and layout", () => {
  for (const breakpoint of BREAKPOINTS) {
    it(`renders safely at ${breakpoint.name}`, async () => {
      const context = await browser.newContext({
        viewport: breakpoint.viewport,
        deviceScaleFactor: 1,
        reducedMotion: "reduce",
        colorScheme: "dark",
      });
      await context.addInitScript(() => {
        const frozen = 1_700_000_000_000;
        const OriginalDate = Date;
        globalThis.Date = class extends OriginalDate {
          constructor(...args: ConstructorParameters<typeof Date>) {
            super(...(args.length === 0 ? [frozen] : args));
          }
          static now() {
            return frozen;
          }
        } as DateConstructor;
      });

      try {
        const page = await context.newPage();
        const response = await page.goto(`${SITE_ORIGIN}/constellation`, {
          waitUntil: "load",
          timeout: 45_000,
        });
        expect(response?.status(), "/constellation should return 200").toBe(200);

        const root = page.locator('[data-constellation-ready="true"]');
        await root.waitFor({ state: "visible", timeout: 45_000 });
        await page.locator("canvas").first().waitFor({ state: "visible", timeout: 30_000 });

        const metrics = await page.evaluate(() => {
          const root = document.querySelector<HTMLElement>("[data-constellation-ready]");
          const canvas = document.querySelector<HTMLCanvasElement>("canvas");
          const back = document.querySelector<HTMLElement>('a[href="/"]');
          const legend = document.querySelector<HTMLElement>("[data-constellation-legend]");
          const hints = [...document.querySelectorAll<HTMLElement>("[data-constellation-hint]")];
          const hint = hints.find((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none" && rect.width > 0 && rect.height > 0;
          });

          const rect = (element: HTMLElement | null | undefined) => {
            if (!element) return null;
            const box = element.getBoundingClientRect();
            return { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
          };
          const overlap = (a: ReturnType<typeof rect>, b: ReturnType<typeof rect>) => {
            if (!a || !b) return Number.POSITIVE_INFINITY;
            return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
              Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          };

          const rootRect = root?.getBoundingClientRect();
          const canvasRect = canvas?.getBoundingClientRect();
          const legendRect = rect(legend);
          const hintRect = rect(hint);
          const inViewport = (box: ReturnType<typeof rect>) =>
            Boolean(
              box &&
                box.left >= -1 &&
                box.top >= -1 &&
                box.right <= window.innerWidth + 1 &&
                box.bottom <= window.innerHeight + 1,
            );

          return {
            starCount: Number(root?.dataset.constellationStarCount ?? 0),
            rootWidth: rootRect?.width ?? 0,
            rootHeight: rootRect?.height ?? 0,
            canvasWidth: canvasRect?.width ?? 0,
            canvasHeight: canvasRect?.height ?? 0,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            backInViewport: inViewport(rect(back)),
            legendInViewport: inViewport(legendRect),
            hintInViewport: inViewport(hintRect),
            legendHintOverlap: overlap(legendRect, hintRect),
          };
        });

        expect(metrics.starCount, "the sky should contain the full catalog").toBeGreaterThan(250);
        expect(metrics.rootWidth).toBeGreaterThanOrEqual(breakpoint.viewport.width - 1);
        expect(metrics.rootHeight).toBeGreaterThanOrEqual(breakpoint.viewport.height - 1);
        expect(metrics.canvasWidth, "the WebGL canvas should fill the viewport").toBeGreaterThan(
          breakpoint.viewport.width * 0.9,
        );
        expect(metrics.canvasHeight, "the WebGL canvas should fill the viewport").toBeGreaterThan(
          breakpoint.viewport.height * 0.9,
        );
        expect(metrics.overflow, "the constellation should not overflow horizontally").toBeLessThanOrEqual(1);
        expect(metrics.backInViewport, "the back link should remain reachable").toBe(true);
        expect(metrics.legendInViewport, "the legend should remain reachable").toBe(true);
        expect(metrics.hintInViewport, "the interaction hint should remain visible").toBe(true);
        expect(metrics.legendHintOverlap, "the legend and hint should not overlap").toBe(0);
      } finally {
        await context.close();
      }
    }, 75_000);
  }
});
