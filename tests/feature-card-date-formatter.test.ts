/**
 * Unit tests guarding FeatureCard's date formatting contract.
 *
 * Regression guards:
 *  1. FeatureCard must import from "../../lib/format-date".
 *  2. Every formatter identifier imported from format-date must actually be
 *     exported by that module (prevents "missing function" runtime errors
 *     of the shape `TypeError: fmtX is not a function`).
 *  3. FeatureCard must render dates via the full month-day-year formatter
 *     (fmtMonthDayYearUTC), not the month-year-only formatter.
 *  4. fmtMonthDayYearUTC output shape is "Mon D, YYYY" and is timezone-safe
 *     for bare YYYY-MM-DD inputs (no off-by-one from local TZ).
 *
 * Run: `bunx vitest run tests/feature-card-date-formatter.test.ts`
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import * as formatDate from "../src/lib/format-date";
import { fmtMonthDayYearUTC } from "../src/lib/format-date";

const CARD_PATH = resolve(__dirname, "../src/components/atlas/FeatureCard.tsx");
const CARD_SRC = readFileSync(CARD_PATH, "utf8");

function importedIdentifiers(src: string, modulePath: string): string[] {
  const re = new RegExp(
    `import\\s*\\{([^}]+)\\}\\s*from\\s*["']${modulePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    "g",
  );
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim().split(/\s+as\s+/)[0].trim();
      if (name) ids.push(name);
    }
  }
  return ids;
}

describe("FeatureCard date formatter contract", () => {
  it("imports from ../../lib/format-date", () => {
    expect(CARD_SRC).toMatch(/from\s+["']\.\.\/\.\.\/lib\/format-date["']/);
  });

  it("only imports identifiers that format-date actually exports", () => {
    const imported = importedIdentifiers(CARD_SRC, "../../lib/format-date");
    expect(imported.length).toBeGreaterThan(0);
    const exported = new Set(Object.keys(formatDate));
    const missing = imported.filter((id) => !exported.has(id));
    expect(missing, `format-date is missing exports: ${missing.join(", ")}`).toEqual([]);
  });

  it("imports the full month-day-year formatter (fmtMonthDayYearUTC)", () => {
    const imported = importedIdentifiers(CARD_SRC, "../../lib/format-date");
    expect(imported).toContain("fmtMonthDayYearUTC");
  });

  it("does not import the month-year-only formatter", () => {
    const imported = importedIdentifiers(CARD_SRC, "../../lib/format-date");
    expect(imported).not.toContain("fmtMonthYearUTC");
    expect(imported).not.toContain("fmtMonthYearFromKeyUTC");
  });

  it("all callable identifiers referenced in FeatureCard resolve to real functions", () => {
    // Catches the "aliased-to-missing-symbol" bug: e.g. `const fmtX = fmtY`
    // where fmtY was never imported. Any bare `fmtXxx(` call site must be
    // either imported from format-date or aliased from an imported symbol.
    const imported = new Set(importedIdentifiers(CARD_SRC, "../../lib/format-date"));
    const aliasRe = /\bconst\s+(fmt[A-Za-z0-9_]*)\s*=\s*(fmt[A-Za-z0-9_]*)/g;
    const aliases = new Map<string, string>();
    let a: RegExpExecArray | null;
    while ((a = aliasRe.exec(CARD_SRC))) aliases.set(a[1], a[2]);

    const callRe = /\b(fmt[A-Za-z0-9_]*)\s*\(/g;
    const calls = new Set<string>();
    let c: RegExpExecArray | null;
    while ((c = callRe.exec(CARD_SRC))) calls.add(c[1]);

    const unresolved: string[] = [];
    for (const name of calls) {
      const target = aliases.get(name) ?? name;
      if (!imported.has(target)) unresolved.push(`${name} -> ${target}`);
    }
    expect(
      unresolved,
      `Unresolved fmt* references in FeatureCard: ${unresolved.join(", ")}`,
    ).toEqual([]);
  });
});

describe("fmtMonthDayYearUTC output", () => {
  it("formats bare YYYY-MM-DD as 'Mon D, YYYY' in UTC", () => {
    expect(fmtMonthDayYearUTC("2026-07-13")).toBe("Jul 13, 2026");
    expect(fmtMonthDayYearUTC("2026-01-01")).toBe("Jan 1, 2026");
    expect(fmtMonthDayYearUTC("2024-12-31")).toBe("Dec 31, 2024");
  });

  it("does not shift the day for TZ-less date-only inputs", () => {
    // Would return "Dec 31, 2025" if parsed in a negative-offset local TZ.
    expect(fmtMonthDayYearUTC("2026-01-01")).toBe("Jan 1, 2026");
  });

  it("never returns a month-year-only string", () => {
    const out = fmtMonthDayYearUTC("2026-06-01");
    expect(out).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    expect(out).not.toMatch(/^[A-Z][a-z]{2} \d{4}$/);
  });
});
