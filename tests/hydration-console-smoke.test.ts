/**
 * Smoke test: reload `/` and `/constellation` in a fresh browser context and
 * fail on any hydration warnings or console errors.
 *
 * Runs against SITE_ORIGIN (defaults to production canonical origin).
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { chromium, type Browser, type ConsoleMessage } from "playwright-core";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;
const VIEWPORT = { width: 1280, height: 900 } as const;

// React hydration / server-mismatch signatures. Minified codes 418, 419, 421,
// 423, 425 all map to hydration/SSR mismatch errors in production builds.
const HYDRATION_PATTERNS: RegExp[] = [
  /hydrat/i,
  /did not match/i,
  /server (?:HTML|rendered)/i,
  /Minified React error #(?:418|419|421|423|425)\b/i,
  /Text content does not match/i,
  /There was an error while hydrating/i,
];

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

interface Capture {
  errors: string[];
  hydration: string[];
  pageErrors: string[];
}

async function loadFresh(path: string): Promise<Capture> {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  const page = await context.newPage();

  const capture: Capture = { errors: [], hydration: [], pageErrors: [] };

  const record = (msg: ConsoleMessage) => {
    const text = msg.text();
    const type = msg.type();
    if (type === "error") capture.errors.push(text);
    if (HYDRATION_PATTERNS.some((re) => re.test(text))) capture.hydration.push(text);
  };
  page.on("console", record);
  page.on("pageerror", (err) => {
    const text = `${err.name}: ${err.message}`;
    capture.pageErrors.push(text);
    if (HYDRATION_PATTERNS.some((re) => re.test(text))) capture.hydration.push(text);
  });

  try {
    const response = await page.goto(`${SITE_ORIGIN}${path}`, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    expect(response?.status(), `${path} should 200`).toBe(200);
    await page.evaluate(() => (document as Document & { fonts?: FontFaceSet }).fonts?.ready);
    // Let post-hydration effects settle so late warnings surface.
    await page.waitForTimeout(1_500);
  } finally {
    await context.close();
  }

  return capture;
}

describe("hydration + console smoke", () => {
  for (const path of ["/", "/constellation"] as const) {
    it(`${path} reloads cleanly with no hydration or console errors`, async () => {
      const capture = await loadFresh(path);
      expect(capture.hydration, `hydration warnings on ${path}`).toEqual([]);
      expect(capture.pageErrors, `page errors on ${path}`).toEqual([]);
      expect(capture.errors, `console errors on ${path}`).toEqual([]);
    }, 60_000);
  }
});
