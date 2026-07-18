/**
 * Cross-platform geometry checks for the light native-SVG constellation.
 * These assertions catch an empty map, clipped controls, overlap, and viewport
 * overflow without depending on operating-system font rasterization.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright-core";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const BREAKPOINTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "tablet", viewport: { width: 768, height: 1024 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
] as const;

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch({
    headless: true,
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
        colorScheme: "light",
      });

      try {
        const page = await context.newPage();
        const response = await page.goto(`${SITE_ORIGIN}/constellation`, {
          waitUntil: "load",
          timeout: 45_000,
        });
        expect(response?.status(), "/constellation should return 200").toBe(200);

        const map = page.locator("[data-atlas-constellation-map]");
        await map.waitFor({ state: "visible", timeout: 45_000 });
        await expect
          .poll(() => page.locator("[data-paper-star]").count(), { timeout: 45_000 })
          .toBeGreaterThan(250);

        const metrics = await page.evaluate(() => {
          const map = document.querySelector<SVGSVGElement>("[data-atlas-constellation-map]");
          const back = document.querySelector<HTMLElement>('a[href="/"]');
          const search = document.querySelector<HTMLElement>("#constellation-search");
          const controls = document.querySelector<HTMLElement>("[data-constellation-controls]");
          const legend = document.querySelector<HTMLElement>("[data-constellation-legend]");

          const rect = (element: Element | null | undefined) => {
            if (!element) return null;
            const box = element.getBoundingClientRect();
            return { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
          };
          const overlap = (a: ReturnType<typeof rect>, b: ReturnType<typeof rect>) => {
            if (!a || !b) return Number.POSITIVE_INFINITY;
            return (
              Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
              Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
            );
          };
          const inViewport = (box: ReturnType<typeof rect>) =>
            Boolean(
              box &&
              box.left >= -1 &&
              box.top >= -1 &&
              box.right <= window.innerWidth + 1 &&
              box.bottom <= window.innerHeight + 1,
            );

          const mapRect = map?.getBoundingClientRect();
          const controlsRect = rect(controls);
          const legendRect = rect(legend);
          return {
            starCount: document.querySelectorAll("[data-paper-star]").length,
            canvasCount: document.querySelectorAll("canvas").length,
            mapWidth: mapRect?.width ?? 0,
            mapHeight: mapRect?.height ?? 0,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            backInViewport: inViewport(rect(back)),
            searchInViewport: inViewport(rect(search)),
            controlsInViewport: inViewport(controlsRect),
            legendInViewport: inViewport(legendRect),
            controlsLegendOverlap: overlap(controlsRect, legendRect),
            zoomInVisible: Boolean(
              document.querySelector<HTMLButtonElement>('button[aria-label="Zoom in"]')
                ?.offsetParent,
            ),
            zoomOutVisible: Boolean(
              document.querySelector<HTMLButtonElement>('button[aria-label="Zoom out"]')
                ?.offsetParent,
            ),
            resetVisible: Array.from(document.querySelectorAll<HTMLButtonElement>("button")).some(
              (button) => button.textContent?.trim() === "Reset" && Boolean(button.offsetParent),
            ),
          };
        });

        expect(
          metrics.starCount,
          "the paper cosmos should contain the full catalog",
        ).toBeGreaterThan(250);
        expect(metrics.canvasCount, "the retired WebGL canvas must stay removed").toBe(0);
        expect(
          metrics.mapWidth,
          "the SVG map should fill the viewport width",
        ).toBeGreaterThanOrEqual(breakpoint.viewport.width - 1);
        expect(
          metrics.mapHeight,
          "the SVG map should retain a usable exploration area",
        ).toBeGreaterThan(breakpoint.viewport.height * 0.55);
        expect(
          metrics.overflow,
          "the constellation should not overflow horizontally",
        ).toBeLessThanOrEqual(1);
        expect(metrics.backInViewport, "the back link should remain reachable").toBe(true);
        expect(metrics.searchInViewport, "the search control should remain reachable").toBe(true);
        expect(metrics.controlsInViewport, "the map controls should remain reachable").toBe(true);
        expect(metrics.legendInViewport, "the legend should remain reachable").toBe(true);
        expect(metrics.controlsLegendOverlap, "controls and legend should not overlap").toBe(0);
        expect(metrics.zoomInVisible).toBe(true);
        expect(metrics.zoomOutVisible).toBe(true);
        expect(metrics.resetVisible).toBe(true);
      } finally {
        await context.close();
      }
    }, 75_000);
  }
});
