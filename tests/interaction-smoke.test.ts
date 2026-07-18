/**
 * Current interaction smoke tests for the light-only, static-first atlas.
 *
 * Run against the local production build in CI by setting SITE_ORIGIN.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { chromium, type Browser, type Page } from "playwright-core";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const VIEWPORT = { width: 1280, height: 900 } as const;

function resolveExecutable(): string | undefined {
  const candidates = [
    "/chromium_headless_shell-1194/chrome-linux/headless_shell",
    "/chromium-1194/chrome-linux/chrome",
  ];
  for (const path of candidates) if (existsSync(path)) return path;
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

async function open(path = "/"): Promise<{ page: Page; close: () => Promise<void> }> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
    colorScheme: "light",
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  const response = await page.goto(`${SITE_ORIGIN}${path}`, {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  expect(response?.status(), `${path} should 200`).toBe(200);
  await page.evaluate(() => (document as Document & { fonts?: FontFaceSet }).fonts?.ready);
  return { page, close: () => context.close() };
}

describe("interaction smoke", () => {
  it("renders the first card page immediately and progressively reveals more", async () => {
    const { page, close } = await open();
    try {
      const cards = page.locator("[data-atlas-feature-card]");
      await expect.poll(() => cards.count()).toBe(24);

      const firstCard = cards.first();
      await expect.poll(() => firstCard.isVisible()).toBe(true);
      expect(await firstCard.evaluate((node) => getComputedStyle(node).opacity)).toBe("1");

      const showMore = page.getByRole("button", { name: /show \d+ more/i });
      await showMore.click();
      await expect.poll(() => cards.count()).toBeGreaterThan(24);
    } finally {
      await close();
    }
  }, 45_000);

  it("keeps the native cursor available and mounts no custom cursor layer", async () => {
    const { page, close } = await open();
    try {
      const state = await page.evaluate(() => {
        const customLayers = Array.from(
          document.querySelectorAll<HTMLElement>("div[aria-hidden]"),
        ).filter((element) => {
          const style = getComputedStyle(element);
          return style.position === "fixed" && Number.parseInt(style.zIndex || "0", 10) >= 9998;
        });
        return {
          bodyCursor: getComputedStyle(document.body).cursor,
          customLayerCount: customLayers.length,
        };
      });

      expect(state.bodyCursor).not.toBe("none");
      expect(state.customLayerCount).toBe(0);
    } finally {
      await close();
    }
  }, 45_000);

  it("opens a full feature record from the editorial card", async () => {
    const { page, close } = await open();
    try {
      const card = page.locator("[data-atlas-feature-card] button").first();
      await card.click();
      await page.waitForURL(/\/features\/[a-z0-9-]+$/, { timeout: 15_000 });
      await expect.poll(() => page.locator("main h1").count()).toBeGreaterThan(0);
    } finally {
      await close();
    }
  }, 45_000);

  it("keeps the draw ceremony non-selectable", async () => {
    const { page, close } = await open("/draw");
    try {
      const selection = await page.evaluate(() => {
        const root = document.querySelector<HTMLElement>(".draw-no-select");
        return root ? getComputedStyle(root).userSelect : null;
      });
      expect(selection).toBe("none");
    } finally {
      await close();
    }
  }, 45_000);
});
