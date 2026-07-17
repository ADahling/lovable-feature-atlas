/**
 * Cross-platform rendering checks for the shared feature-detail template.
 * Catalog completeness is covered by the feature-data audit; this matrix
 * covers long content, major categories, and each lifecycle state.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright-core";
import { existsSync } from "node:fs";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const VIEWPORT = { width: 1280, height: 900 } as const;
const SLUGS = [
  "mapbox-connector",
  "plan-mode",
  "new-openai-image-models-for-ai-features-in-your-app",
  "design-guidance",
  "wiz-findings-integration",
  "lovable-desktop-app",
  "improved-sharing-links",
  "test-and-live-environments",
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

describe("feature detail rendering", () => {
  it.each(SLUGS)("renders /features/%s without layout failures", async (slug) => {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      colorScheme: "light",
    });

    try {
      const page = await context.newPage();
      const response = await page.goto(`${SITE_ORIGIN}/features/${slug}`, {
        waitUntil: "load",
        timeout: 45_000,
      });

      expect(response?.status(), `/features/${slug} should return 200`).toBe(200);
      await page.locator("main").waitFor({ state: "visible", timeout: 30_000 });
      await page.locator("main h1").first().waitFor({ state: "visible", timeout: 30_000 });

      const state = await page.evaluate(() => {
        const main = document.querySelector("main");
        const heading = main?.querySelector("h1");
        const mainRect = main?.getBoundingClientRect();
        return {
          heading: heading?.textContent?.trim() ?? "",
          mainWidth: mainRect?.width ?? 0,
          mainHeight: mainRect?.height ?? 0,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          hasLegacyLoader: Boolean(document.querySelector("#atlas-thematic-loader")),
        };
      });

      expect(state.heading.length, `${slug} should have a real title`).toBeGreaterThan(1);
      expect(state.heading, `${slug} should not render the not-found state`).not.toBe(
        "Feature not found",
      );
      expect(state.mainWidth, `${slug} main content should have width`).toBeGreaterThan(300);
      expect(state.mainHeight, `${slug} main content should have height`).toBeGreaterThan(400);
      expect(state.overflow, `${slug} should not overflow horizontally`).toBeLessThanOrEqual(2);
      expect(state.hasLegacyLoader, `${slug} should not restore the deleted loader`).toBe(false);
    } finally {
      await context.close();
    }
  }, 60_000);
});
