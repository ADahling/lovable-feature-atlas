/**
 * Guarantees FeatureCard always renders full month-day-year release dates
 * (e.g. "Jul 13, 2026") for every feature in the atlas dataset, and never
 * falls back to a month-year-only string.
 *
 * Strategy: FeatureCard renders `feature.releaseDate` through a single
 * formatter call in JSX. We assert:
 *   1. The JSX uses `fmtMonthDayYearUTC` (directly or via a local alias)
 *      inside `{...(feature.releaseDate)}` expressions — the only path a
 *      release date reaches the DOM.
 *   2. Running that same formatter against every feature in the dataset
 *      produces a "Mon D, YYYY" string (never "Mon YYYY").
 *
 * Combined, these two checks mean every rendered FeatureCard shows a full
 * date without needing a DOM renderer.
 *
 * Run: `bunx vitest run tests/feature-card-renders-full-date.test.ts`
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { fmtMonthDayYearUTC } from "../src/lib/format-date";
import { features } from "../src/data/features";

const CARD_PATH = resolve(__dirname, "../src/components/atlas/EditorialFeatureCard.tsx");
const CARD_SRC = readFileSync(CARD_PATH, "utf8");

const FULL_DATE_RE = /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/;
const MONTH_YEAR_ONLY_RE = /^[A-Z][a-z]{2} \d{4}$/;

/** Names bound to fmtMonthDayYearUTC (import + `const x = fmtMonthDayYearUTC` aliases). */
function fullDateFormatterAliases(src: string): Set<string> {
  const names = new Set<string>(["fmtMonthDayYearUTC"]);
  const aliasRe = /\bconst\s+(fmt[A-Za-z0-9_]*)\s*=\s*(fmt[A-Za-z0-9_]*)\b/g;
  let m: RegExpExecArray | null;
  // resolve transitively
  const direct = new Map<string, string>();
  while ((m = aliasRe.exec(src))) direct.set(m[1], m[2]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [alias, target] of direct) {
      if (names.has(target) && !names.has(alias)) {
        names.add(alias);
        changed = true;
      }
    }
  }
  return names;
}

describe("FeatureCard renders full month-day-year dates", () => {
  it("every render of feature.releaseDate goes through fmtMonthDayYearUTC (or an alias)", () => {
    const aliases = fullDateFormatterAliases(CARD_SRC);
    const releaseDateCallRe = /(fmt[A-Za-z0-9_]*)\s*\(\s*feature\.releaseDate\s*\)/g;
    const calls: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = releaseDateCallRe.exec(CARD_SRC))) calls.push(m[1]);

    expect(
      calls.length,
      "FeatureCard must render feature.releaseDate at least once",
    ).toBeGreaterThan(0);

    const bad = calls.filter((name) => !aliases.has(name));
    expect(
      bad,
      `feature.releaseDate is being formatted by non-full-date formatter(s): ${bad.join(", ")}`,
    ).toEqual([]);
  });

  it("no month-year-only formatter is used on feature.releaseDate", () => {
    // Explicit belt-and-suspenders check for known regressions.
    expect(CARD_SRC).not.toMatch(/fmtMonthYearUTC\s*\(\s*feature\.releaseDate\s*\)/);
    expect(CARD_SRC).not.toMatch(/fmtMonthYearFromKeyUTC\s*\(\s*feature\.releaseDate\s*\)/);
  });

  it("every feature in the dataset formats to a full 'Mon D, YYYY' string", () => {
    expect(features.length).toBeGreaterThan(0);
    const failures: Array<{ id: string; releaseDate: string; formatted: string }> = [];
    for (const f of features) {
      const formatted = fmtMonthDayYearUTC(f.releaseDate);
      if (!FULL_DATE_RE.test(formatted) || MONTH_YEAR_ONLY_RE.test(formatted)) {
        failures.push({ id: f.id, releaseDate: f.releaseDate, formatted });
      }
    }
    expect(
      failures,
      `Features that do not render as full 'Mon D, YYYY':\n${failures
        .map((x) => `  ${x.id} (${x.releaseDate}) -> "${x.formatted}"`)
        .join("\n")}`,
    ).toEqual([]);
  });
});
