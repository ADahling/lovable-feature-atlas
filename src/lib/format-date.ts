// Deterministic UTC date formatters. Avoids workerd Intl quirks where
// `toLocaleDateString({ timeZone: "UTC" })` may fall back to the runtime's
// local timezone, causing SSR/client hydration mismatches around month/day boundaries.

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function parseUtc(iso: string): Date {
  // Treat bare YYYY-MM-DD as UTC midnight; pass through anything with explicit time/zone.
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  return new Date(isDateOnly ? `${iso}T00:00:00Z` : iso);
}

export function fmtMonthYearUTC(iso: string): string {
  const d = parseUtc(iso);
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function fmtMonthDayYearUTC(iso: string): string {
  const d = parseUtc(iso);
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function fmtMonthYearFromKeyUTC(key: string): string {
  // key is "YYYY-MM"
  const [y, m] = key.split("-");
  const monthIdx = Math.max(0, Math.min(11, Number(m) - 1));
  return `${MONTHS_SHORT[monthIdx]} ${y}`;
}
