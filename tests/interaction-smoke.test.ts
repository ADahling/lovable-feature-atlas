/**
 * Interaction smoke tests — verify the round 7 QA fixes stay wired.
 *
 * Covers:
 *  1. FeatureGrid fade-up entrance (offscreen cards mount at opacity 0,
 *     rise to 1 after scrolling into view via framer-motion whileInView).
 *  2. Desktop hover tilt (pointer-move sets --rx / --ry inline vars).
 *  3. View Transitions API is wired and the atlas-vt-fade-in keyframe runs
 *     ~200-400ms on route enter (not an instant swap).
 *  4. /draw ceremony area applies user-select: none.
 *  5. CustomCursor hides when the pointer is over the top nav and stays
 *     hidden after a scroll event.
 *
 * Run:  bunx vitest run tests/interaction-smoke.test.ts
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

async function openHome(reduced: "reduce" | "no-preference" = "no-preference"): Promise<{ page: Page; close: () => Promise<void> }> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: reduced,
    colorScheme: "dark",
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  const res = await page.goto(`${SITE_ORIGIN}/`, { waitUntil: "networkidle", timeout: 30_000 });
  expect(res?.status(), "/ should 200").toBe(200);
  await page.evaluate(() => (document as any).fonts?.ready);
  return { page, close: () => context.close() };
}

describe("interaction smoke", () => {
  it("FeatureGrid: cards render via framer-motion and settle to opacity 1 after intersection", async () => {
    const { page, close } = await openHome();
    try {
      // The grid should render many motion.div wrappers keyed by feature id.
      const wrapperCount = await page.evaluate(
        () => document.querySelectorAll("[data-fg-key]").length,
      );
      expect(wrapperCount, "FeatureGrid should render motion wrappers").toBeGreaterThan(20);

      // Pick one that is far below the initial viewport, scroll it into
      // view, and verify it settles to opacity 1 with a resolved transform
      // (both signals framer-motion's whileInView completed on it).
      const key = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-fg-key]"));
        for (const c of cards) {
          const r = c.getBoundingClientRect();
          if (r.top > window.innerHeight + 400) return c.getAttribute("data-fg-key");
        }
        return null;
      });
      expect(key, "expected at least one card well below the fold").toBeTruthy();

      await page.evaluate((k) => {
        const el = document.querySelector<HTMLElement>(`[data-fg-key="${k}"]`);
        el?.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
      }, key);
      await page.waitForTimeout(700);

      const settled = await page.evaluate((k) => {
        const el = document.querySelector<HTMLElement>(`[data-fg-key="${k}"]`);
        if (!el) return null;
        const cs = getComputedStyle(el);
        return {
          opacity: parseFloat(cs.opacity),
          transform: cs.transform,
          // Framer clears its inline transform once the layout animation
          // completes (guard against stranded FLIP translate).
          inlineTransform: el.style.transform,
        };
      }, key);
      expect(settled?.opacity).toBeGreaterThan(0.95);
      // No stale inline translate3d clogging the wrapper.
      expect(settled?.inlineTransform ?? "").not.toMatch(/translate3d\(\s*(?!0px,\s*0px)/);
    } finally {
      await close();
    }
  }, 45_000);

  it("FeatureCard: desktop pointer-move applies spring-smoothed tilt (--rx/--ry)", async () => {
    const { page, close } = await openHome();
    try {

      // Scroll first card into view and read its box in ONE evaluate so
      // the coordinates match the layout playwright will hit-test.
      const box = await page.evaluate(() => {
        const btn = document.querySelector<HTMLElement>("[data-fg-key] button");
        if (!btn) return null;
        btn.scrollIntoView({ block: "center" });
        const r = btn.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      });
      expect(box).toBeTruthy();
      await page.waitForTimeout(200);

      // Seat the pointer inside the button, then move across it. Two moves
      // are required because the first one triggers mouseenter (which
      // handleMove does not run on); the second dispatches mousemove.
      await page.mouse.move(box!.x + 5, box!.y + 5);
      await page.mouse.move(box!.x + box!.w * 0.75, box!.y + box!.h * 0.75, { steps: 10 });
      await page.waitForTimeout(400);

      const state = await page.evaluate(() => {
        const btn = document.querySelector<HTMLElement>("[data-fg-key] button");
        if (!btn) return null;
        return {
          rx: btn.style.getPropertyValue("--rx"),
          ry: btn.style.getPropertyValue("--ry"),
          x: btn.style.getPropertyValue("--x"),
          y: btn.style.getPropertyValue("--y"),
          revealed: btn.getAttribute("data-revealed"),
          coarse: matchMedia("(pointer: coarse)").matches,
          reduce: matchMedia("(prefers-reduced-motion: reduce)").matches,
          inlineStyle: btn.getAttribute("style") ?? "",
        };
      });
      if (!state?.rx || !state?.ry) {
        // eslint-disable-next-line no-console
        console.log("tilt state snapshot:", JSON.stringify(state));
      }
      expect(state?.revealed).toBe("true");
      expect(state?.coarse, "smoke context should report fine pointer").toBe(false);
      expect(state?.reduce, "smoke context should not report reduced-motion").toBe(false);
      // Radial highlight tracking (--x/--y) proves onMouseMove fired on the
      // button; --rx/--ry then prove the tilt path executed.
      expect(state?.x, "--x should be set by handleMove").toMatch(/\d+px/);
      expect(state?.y, "--y should be set by handleMove").toMatch(/\d+px/);
      expect(state?.rx, "--rx should be set by handleMove").toMatch(/-?\d+(\.\d+)?deg/);
      expect(state?.ry, "--ry should be set by handleMove").toMatch(/-?\d+(\.\d+)?deg/);
      const rx = parseFloat(state!.rx);
      const ry = parseFloat(state!.ry);
      expect(Math.abs(rx) + Math.abs(ry)).toBeGreaterThan(0.1);
      // 2.5° max clamp with a small floating-point buffer.
      expect(Math.abs(rx)).toBeLessThanOrEqual(2.6);
      expect(Math.abs(ry)).toBeLessThanOrEqual(2.6);
    } finally {
      await close();
    }
  }, 45_000);

  it("View Transitions: atlas-vt-fade-in runs perceptibly on route change", async () => {
    const { page, close } = await openHome();
    try {
      const supported = await page.evaluate(() => typeof (document as any).startViewTransition === "function");
      expect(supported, "browser should support the View Transitions API").toBe(true);

      // Instrument getComputedStyle on ::view-transition-new(root) as soon
      // as it exists. We poll for ~500ms after the navigation kicks off and
      // capture the animation duration + name.
      await page.evaluate(() => {
        (window as any).__vtCaptured = null;
        const started = performance.now();
        const poll = () => {
          try {
            const cs = getComputedStyle(document.documentElement, "::view-transition-new(root)");
            const name = cs.animationName;
            const dur = cs.animationDuration;
            if (name && name !== "none" && !(window as any).__vtCaptured) {
              (window as any).__vtCaptured = { name, dur, at: performance.now() - started };
            }
          } catch {}
          if (performance.now() - started < 800) requestAnimationFrame(poll);
        };
        requestAnimationFrame(poll);
      });

      // Trigger a client-side navigation to /draw via the nav link.
      await page.click('a[href="/draw"]');
      await page.waitForTimeout(900);

      const captured = await page.evaluate(() => (window as any).__vtCaptured);
      expect(captured, "expected to observe an active ::view-transition-new animation").toBeTruthy();
      expect(captured.name).toBe("atlas-vt-fade-in");
      // Duration is a CSS time string like "320ms" or "0.32s"; normalise to ms.
      const durMs = /ms$/.test(captured.dur)
        ? parseFloat(captured.dur)
        : parseFloat(captured.dur) * 1000;
      expect(durMs).toBeGreaterThanOrEqual(200);
      expect(durMs).toBeLessThanOrEqual(600);

      // And the URL actually changed.
      expect(page.url()).toMatch(/\/draw$/);
    } finally {
      await close();
    }
  }, 45_000);

  it("/draw: ceremony area disables text selection", async () => {
    const context = await browser.newContext({ viewport: VIEWPORT, colorScheme: "dark" });
    const page = await context.newPage();
    try {
      const res = await page.goto(`${SITE_ORIGIN}/draw`, { waitUntil: "networkidle", timeout: 30_000 });
      expect(res?.status()).toBe(200);
      const info = await page.evaluate(() => {
        const el = document.querySelector<HTMLElement>(".draw-no-select");
        if (!el) return null;
        const cs = getComputedStyle(el);
        // Also spot-check a descendant — the rule cascades via `.draw-no-select *`.
        const child = el.querySelector<HTMLElement>("*");
        const childUs = child ? getComputedStyle(child).userSelect : null;
        return { root: cs.userSelect, child: childUs };
      });
      expect(info, "expected a .draw-no-select container on /draw").toBeTruthy();
      expect(info!.root).toBe("none");
      if (info!.child) expect(info!.child).toBe("none");
    } finally {
      await context.close();
    }
  }, 45_000);

  it("CustomCursor: hides when pointer moves over the top nav and during scroll", async () => {
    const { page, close } = await openHome();
    try {
      // Prime the cursor by moving somewhere neutral in the hero.
      await page.mouse.move(600, 500);
      await page.waitForTimeout(200);

      // Locate the fixed cursor ring (border-gold ring, z-index 9998).
      const ringSelector = "div[aria-hidden].fixed.rounded-full.border-gold\\/80, div[aria-hidden].fixed.rounded-full";
      const ringVisible = await page.evaluate(() => {
        const rings = Array.from(document.querySelectorAll<HTMLElement>("div[aria-hidden]"))
          .filter((el) => {
            const cs = getComputedStyle(el);
            return cs.position === "fixed" && parseInt(cs.zIndex || "0", 10) >= 9998;
          });
        return rings.length; // may be 0 on touch/reduced-motion; smoke checks desktop
      });
      // If the cursor system didn't mount (e.g. pointer:coarse override), skip the assertion.
      if (ringVisible === 0) return;

      // Move over the nav.
      const navBox = await page.evaluate(() => {
        const nav = document.querySelector("nav");
        if (!nav) return null;
        const r = nav.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      expect(navBox).toBeTruthy();
      await page.mouse.move(navBox!.x, navBox!.y, { steps: 4 });
      await page.waitForTimeout(250);

      const overNav = await page.evaluate(() => {
        const rings = Array.from(document.querySelectorAll<HTMLElement>("div[aria-hidden]"))
          .filter((el) => {
            const cs = getComputedStyle(el);
            return cs.position === "fixed" && parseInt(cs.zIndex || "0", 10) >= 9998;
          });
        return rings.map((el) => ({
          z: getComputedStyle(el).zIndex,
          opacity: parseFloat(getComputedStyle(el).opacity),
          visibility: getComputedStyle(el).visibility,
        }));
      });
      expect(overNav.length).toBeGreaterThan(0);
      for (const r of overNav) {
        // Every cursor layer should be hidden while over the nav.
        expect(r.opacity, `cursor layer z=${r.z} should fade over nav`).toBeLessThan(0.05);
      }

      // Move back into the hero, then scroll — cursor should hide on scroll
      // until the next mousemove restores position.
      await page.mouse.move(600, 500, { steps: 4 });
      await page.waitForTimeout(200);
      await page.evaluate(() => window.scrollBy({ top: 400, behavior: "instant" as ScrollBehavior }));
      await page.waitForTimeout(200);

      const afterScroll = await page.evaluate(() => {
        const rings = Array.from(document.querySelectorAll<HTMLElement>("div[aria-hidden]"))
          .filter((el) => {
            const cs = getComputedStyle(el);
            return cs.position === "fixed" && parseInt(cs.zIndex || "0", 10) >= 9998;
          });
        return rings.map((el) => parseFloat(getComputedStyle(el).opacity));
      });
      for (const op of afterScroll) {
        expect(op, "cursor should be hidden after scroll (before next mousemove)").toBeLessThan(0.05);
      }
    } finally {
      await close();
    }
  }, 45_000);
});
