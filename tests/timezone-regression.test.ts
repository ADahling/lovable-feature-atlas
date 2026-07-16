/**
 * Timezone regression check.
 *
 * Renders key feature and category routes in two IANA timezones that sit
 * on opposite sides of UTC. If any month/day/year text in the rendered
 * DOM differs between the two runs, the test fails — that's the signal
 * a `toLocaleDateString` / `new Date(...).getDate()` slipped in without
 * a `timeZone: "UTC"` option and will show yesterday's date to visitors
 * west of GMT (or tomorrow's to visitors east of GMT).
 *
 * Uses Playwright's `timezoneId` context option, which overrides the
 * browser's `Intl` timezone for any post-hydration client-side date
 * formatting. Server-rendered HTML uses the server's TZ (fixed) so any
 * drift observed here comes from client code.
 *
 * Run:  bunx vitest run tests/timezone-regression.test.ts
 * Skips cleanly if FETCH_ORIGIN is unreachable so CI never fails on
 * missing infrastructure.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright-core";
import { existsSync } from "node:fs";
import { features } from "../src/data/features";
import { categorySlug } from "../src/lib/categories";

const FETCH_ORIGIN = process.env.FETCH_ORIGIN ?? "http://localhost:8080";
// Opposite extremes: Kiritimati is UTC+14, Midway is UTC-11 — 25h apart,
// which guarantees any bare `new Date("YYYY-MM-DD")` render will drift.
const TIMEZONES = ["Pacific/Kiritimati", "Pacific/Midway"] as const;

// Match "Jan 6, 2025" / "January 6, 2025" / "Oct 2025" / "October 2025".
const MONTHS =
  "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*";
const DATE_RE = new RegExp(`\\b${MONTHS}\\s+\\d{1,2},\\s*\\d{4}\\b|\\b${MONTHS}\\s+\\d{4}\\b`, "g");

function resolveExecutable(): string | undefined {
  const candidates = [
    "/chromium_headless_shell-1194/chrome-linux/headless_shell",
    "/chromium-1194/chrome-linux/chrome",
  ];
  for (const p of candidates) if (existsSync(p)) return p;
  return undefined;
}

async function isReachable(origin: string): Promise<boolean> {
  try {
    const res = await fetch(`${origin}/sitemap.xml`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok || res.status === 404;
  } catch {
    return false;
  }
}

// Representative paths: home (latest-feature banner), three feature pages
// spanning different release dates, and one category page (month/year rows).
const SAMPLE_FEATURE_IDS = ["lovable-cloud", "voice-mode", "mapbox-connector"];
const SAMPLE_CATEGORY = features[0]?.category;
const ROUTES = [
  "/",
  ...SAMPLE_FEATURE_IDS.filter((id) => features.some((f) => f.id === id)).map(
    (id) => `/features/${id}`,
  ),
  ...(SAMPLE_CATEGORY ? [`/categories/${categorySlug(SAMPLE_CATEGORY)}`] : []),
];

let browser: Browser;
let originReachable = false;

beforeAll(async () => {
  originReachable = await isReachable(FETCH_ORIGIN);
  if (!originReachable) {
    console.warn(
      `[timezone-regression] FETCH_ORIGIN ${FETCH_ORIGIN} unreachable — skipping.`,
    );
    return;
  }
  browser = await chromium.launch({
    headless: true,
    executablePath: resolveExecutable(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

async function collectDates(path: string, timezoneId: string): Promise<string[]> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
    timezoneId,
    // Pin locale so Intl output doesn't drift between runs.
    locale: "en-US",
  });
  const page = await context.newPage();
  try {
    await page.goto(`${FETCH_ORIGIN}${path}`, {
      waitUntil: "networkidle",
      timeout: 20_000,
    });
    // Let any post-hydration effects that touch dates settle.
    await page.waitForTimeout(300);
    const text = await page.evaluate(() => document.body.innerText);
    const matches = text.match(DATE_RE) ?? [];
    // Sort + dedupe so ordering churn doesn't cause false positives; the
    // invariant we care about is "the SET of dates is identical".
    return [...new Set(matches)].sort();
  } finally {
    await context.close();
  }
}

describe("timezone regression: rendered dates are TZ-invariant", () => {
  for (const path of ROUTES) {
    it(`${path} renders identical dates across ${TIMEZONES.join(" vs ")}`, async () => {
      if (!originReachable) {
        console.warn(`[timezone-regression] skipping ${path}`);
        return;
      }
      const [east, west] = await Promise.all(
        TIMEZONES.map((tz) => collectDates(path, tz)),
      );
      // Sanity: at least one date rendered, otherwise the regex/route drifted.
      expect(east.length, `no dates rendered on ${path}`).toBeGreaterThan(0);
      expect(west).toEqual(east);
    }, 45_000);
  }
});
