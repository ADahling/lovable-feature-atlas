/**
 * Responsive geometry checks for the surfaces most prone to layout shift.
 * Pixel baselines were intentionally replaced: OS font rasterization made
 * them fail on unchanged UI. These checks stay strict about user-visible
 * breakage while remaining portable between local Windows and Linux CI.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright-core";
import { existsSync } from "node:fs";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "http://localhost:8080";
const BREAKPOINTS = [
  { name: "mobile", viewport: { width: 390, height: 844 } },
  { name: "tablet", viewport: { width: 768, height: 1024 } },
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "ultrawide", viewport: { width: 2560, height: 1080 } },
] as const;
const TARGETS = [
  { name: "hero", path: "/", selector: "[data-atlas-hero-canvas]" },
  { name: "feature-card", path: "/", selector: "[data-atlas-feature-card]" },
  { name: "timeline", path: "/?view=timeline", selector: "[data-atlas-timeline]" },
  { name: "quiz", path: "/quiz", selector: "main" },
] as const;

const deterministicStyles = `
  *, *::before, *::after {
    animation-duration: 0ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0ms !important;
    transition-delay: 0ms !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
  [data-atlas-feature-card], [data-atlas-timeline] {
    content-visibility: visible !important;
    contain-intrinsic-size: auto !important;
  }
  [data-fg-key], [data-atlas-feature-card], [data-atlas-timeline] button {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
  }
`;

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

async function measure(page: Page, selector: string) {
  await page.waitForFunction(
    (candidate) =>
      [...document.querySelectorAll<HTMLElement>(candidate)].some((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 16 && rect.height > 16;
      }),
    selector,
    { timeout: 30_000 },
  );

  // Scroll-then-wait, retried: TanStack's one-time hydration scroll-reset
  // can undo a scroll performed before hydration completes on slow runners,
  // so a second attempt after the reset always lands.
  const scrollTarget = async () =>
    page.evaluate((candidate) => {
      const element = [...document.querySelectorAll<HTMLElement>(candidate)].find((item) => {
        const rect = item.getBoundingClientRect();
        return rect.width > 16 && rect.height > 16;
      });
      element?.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
    }, selector);

  const waitInViewport = async (timeout: number) =>
    page.waitForFunction(
      (candidate) => {
        const element = [...document.querySelectorAll<HTMLElement>(candidate)].find((item) => {
          const rect = item.getBoundingClientRect();
          return rect.width > 16 && rect.height > 16;
        });
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
          rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight
        );
      },
      selector,
      { timeout },
    );

  for (let attempt = 0; attempt < 3; attempt++) {
    await scrollTarget();
    try {
      await waitInViewport(attempt < 2 ? 10_000 : 30_000);
      break;
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }

  await page.waitForTimeout(250);
  return page.evaluate((candidate) => {
    const element = [...document.querySelectorAll<HTMLElement>(candidate)].find((item) => {
      const rect = item.getBoundingClientRect();
      return rect.width > 16 && rect.height > 16;
    });
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      viewportWidth: innerWidth,
      viewportHeight: innerHeight,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      overflowCandidates: [...document.querySelectorAll<HTMLElement>("body *")]
        .map((item) => {
          const box = item.getBoundingClientRect();
          return {
            element: `${item.tagName.toLowerCase()}${item.id ? `#${item.id}` : ""}`,
            className: typeof item.className === "string" ? item.className.slice(0, 120) : "",
            left: Math.round(box.left),
            right: Math.round(box.right),
          };
        })
        .filter((item) => item.left < -2 || item.right > innerWidth + 2)
        .slice(0, 8),
    };
  }, selector);
}

describe("responsive layout safety", () => {
  for (const breakpoint of BREAKPOINTS) {
    for (const target of TARGETS) {
      it(`${target.name} stays usable at ${breakpoint.name}`, async () => {
        const context = await browser.newContext({
          viewport: breakpoint.viewport,
          deviceScaleFactor: 1,
          reducedMotion: "reduce",
          colorScheme: "light",
        });

        try {
          const page = await context.newPage();
          const response = await page.goto(`${SITE_ORIGIN}${target.path}`, {
            waitUntil: "load",
            timeout: 45_000,
          });
          expect(response?.status(), `${target.path} should return 200`).toBe(200);
          await page.addStyleTag({ content: deterministicStyles });
          const metrics = await measure(page, target.selector);

          expect(metrics, `${target.selector} should have visible geometry`).not.toBeNull();
          if (!metrics) return;
          expect(metrics.width).toBeGreaterThan(16);
          expect(metrics.height).toBeGreaterThan(16);
          expect(metrics.right, `${target.name} should enter the viewport`).toBeGreaterThan(0);
          expect(metrics.left, `${target.name} should enter the viewport`).toBeLessThan(
            metrics.viewportWidth,
          );
          expect(metrics.bottom, `${target.name} should enter the viewport`).toBeGreaterThan(0);
          expect(metrics.top, `${target.name} should enter the viewport`).toBeLessThan(
            metrics.viewportHeight,
          );
          expect(
            metrics.pageOverflow,
            `${target.path} should not overflow horizontally. Candidates: ${JSON.stringify(metrics.overflowCandidates)}`,
          ).toBeLessThanOrEqual(2);
        } finally {
          await context.close();
        }
      }, 60_000);
    }
  }
});
