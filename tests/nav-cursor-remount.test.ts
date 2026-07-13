/**
 * Regression: CustomCursor + top-nav framer layout remounts.
 *
 * Ensures that repeated pointer interactions with the top nav (Quiz link,
 * ThemeToggle, all nav links) never leave detached cursor nodes and that
 * cursor layers stay opacity-collapsed (not merely transition-fading) the
 * entire time the pointer is over the nav — including across a theme-toggle
 * click, which triggers a framer-motion layout remount of the nav tree.
 *
 * Guards two prior regressions:
 *  1. Cursor opacity transitions leaking hover fade over nav.
 *  2. Framer AnimatePresence/layout swaps leaving orphaned cursor DOM.
 *
 * Run:  bunx vitest run tests/nav-cursor-remount.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser, type Page } from "playwright-core";
import { existsSync } from "node:fs";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const VIEWPORT = { width: 1280, height: 900 } as const;

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

async function openHome(): Promise<{ page: Page; close: () => Promise<void> }> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
    colorScheme: "dark",
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  const res = await page.goto(`${SITE_ORIGIN}/`, { waitUntil: "networkidle", timeout: 30_000 });
  expect(res?.status(), "/ should 200").toBe(200);
  await page.evaluate(() => (document as any).fonts?.ready);
  // Wait out the thematic loader so it doesn't share z-index with cursor.
  await page.waitForFunction(() => {
    const el = document.getElementById("atlas-thematic-loader");
    if (!el) return true;
    const cs = getComputedStyle(el);
    return cs.display === "none" || parseFloat(cs.opacity) === 0;
  }, { timeout: 5000 }).catch(() => {});
  const close = async () => { await context.close(); };
  return { page, close };
}

/**
 * Snapshot every cursor layer in the DOM with its connectedness + visibility.
 * A cursor layer = fixed-position, aria-hidden div at z >= 9998, not the
 * thematic loader.
 */
function cursorSnapshot(page: Page) {
  return page.evaluate(() => {
    const rings = Array.from(document.querySelectorAll<HTMLElement>("div[aria-hidden]"))
      .filter((el) => {
        if (el.id === "atlas-thematic-loader") return false;
        if (el.closest("#atlas-thematic-loader")) return false;
        const cs = getComputedStyle(el);
        return cs.position === "fixed" && parseInt(cs.zIndex || "0", 10) >= 9998;
      });
    return rings.map((el) => ({
      connected: el.isConnected,
      inBody: document.body.contains(el),
      opacity: parseFloat(getComputedStyle(el).opacity),
      visibility: getComputedStyle(el).visibility,
      transition: getComputedStyle(el).transitionProperty,
    }));
  });
}

async function navTargets(page: Page) {
  return page.evaluate(() => {
    const nav = document.querySelector("nav");
    if (!nav) return [] as Array<{ x: number; y: number; label: string }>;
    const els = Array.from(nav.querySelectorAll<HTMLElement>("a, button"));
    return els
      .map((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return null;
        return {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
        };
      })
      .filter((x): x is { x: number; y: number; label: string } => x !== null);
  });
}

describe("nav cursor remount regression", () => {
  it("cursor stays hidden and attached across nav hovers + theme toggle remount", async () => {
    const { page, close } = await openHome();
    try {
      // Prime cursor into hero.
      await page.mouse.move(600, 500);
      await page.waitForTimeout(200);

      const baseline = await cursorSnapshot(page);
      // Skip on environments that don't mount the cursor (touch/reduced-motion).
      if (baseline.length === 0) return;

      // Every layer must not use `opacity` in its transition list — the fix
      // for the prior regression was to remove opacity transitions so hide
      // is instant. This guards against re-introducing a fade.
      for (const layer of baseline) {
        expect(
          !/\bopacity\b/.test(layer.transition),
          `cursor layer transition-property must not include opacity (got "${layer.transition}")`,
        ).toBe(true);
      }

      const targets = await navTargets(page);
      expect(targets.length, "expected interactive elements inside <nav>").toBeGreaterThan(0);

      // Sweep every nav target. After each hover, verify:
      //  - cursor layer count is unchanged (no orphaned duplicates spawned).
      //  - every cursor layer is still connected + in <body>.
      //  - every cursor layer is opacity-collapsed or visibility:hidden.
      const initialCount = baseline.length;
      for (const t of targets) {
        await page.mouse.move(t.x, t.y, { steps: 3 });
        await page.waitForTimeout(120);
        const snap = await cursorSnapshot(page);
        expect(snap.length, `cursor layer count changed hovering "${t.label}"`).toBe(initialCount);
        for (const layer of snap) {
          expect(layer.connected, `detached cursor layer while hovering "${t.label}"`).toBe(true);
          expect(layer.inBody, `orphaned cursor layer (not in body) while hovering "${t.label}"`).toBe(true);
          expect(
            layer.visibility === "hidden" || layer.opacity < 0.05,
            `cursor layer visible over nav "${t.label}" (opacity=${layer.opacity}, visibility=${layer.visibility})`,
          ).toBe(true);
        }
      }

      // Trigger a framer layout remount of the nav via the theme toggle.
      const toggle = await page.evaluate(() => {
        const nav = document.querySelector("nav");
        if (!nav) return null;
        const btn = nav.querySelector<HTMLElement>('[aria-label*="theme" i], [data-cursor="button"][aria-label], button[aria-label*="dark" i], button[aria-label*="light" i]')
          ?? Array.from(nav.querySelectorAll<HTMLElement>("button")).find((b) => /theme|dark|light/i.test(b.getAttribute("aria-label") ?? ""));
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });

      if (toggle) {
        await page.mouse.move(toggle.x, toggle.y, { steps: 2 });
        await page.waitForTimeout(80);
        await page.mouse.down();
        await page.mouse.up();
        // Let framer-motion complete any layout swap.
        await page.waitForTimeout(400);

        const afterToggle = await cursorSnapshot(page);
        expect(afterToggle.length, "cursor layer count changed after theme toggle remount").toBe(initialCount);
        for (const layer of afterToggle) {
          expect(layer.connected, "cursor layer detached after theme toggle").toBe(true);
          expect(layer.inBody, "cursor layer left <body> after theme toggle").toBe(true);
          expect(
            layer.visibility === "hidden" || layer.opacity < 0.05,
            `cursor layer visible over nav after theme toggle (opacity=${layer.opacity}, visibility=${layer.visibility})`,
          ).toBe(true);
        }

        // Re-sweep targets after remount — the freshly mounted nav tree must
        // still trigger the same hide behavior.
        const postTargets = await navTargets(page);
        for (const t of postTargets) {
          await page.mouse.move(t.x, t.y, { steps: 3 });
          await page.waitForTimeout(100);
          const snap = await cursorSnapshot(page);
          expect(snap.length, `post-remount: cursor layer count changed on "${t.label}"`).toBe(initialCount);
          for (const layer of snap) {
            expect(layer.connected, `post-remount detached layer on "${t.label}"`).toBe(true);
            expect(
              layer.visibility === "hidden" || layer.opacity < 0.05,
              `post-remount cursor visible on "${t.label}" (opacity=${layer.opacity})`,
            ).toBe(true);
          }
        }
      }

      // Finally: leave the nav — cursor must become visible again on a
      // pointer move in the hero, proving hide/show is purely nav-scoped
      // and not stuck.
      await page.mouse.move(600, 600, { steps: 4 });
      await page.waitForTimeout(200);
      const idle = await cursorSnapshot(page);
      const anyVisible = idle.some((l) => l.visibility !== "hidden" && l.opacity >= 0.5);
      expect(anyVisible, "cursor never restored to visible after leaving nav").toBe(true);
    } finally {
      await close();
    }
  }, 60_000);
});
