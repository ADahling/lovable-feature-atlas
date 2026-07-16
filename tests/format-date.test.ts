import { describe, it, expect, afterAll, beforeAll } from "vitest";
import {
  fmtMonthDayYearUTC,
  fmtMonthYearUTC,
  fmtMonthYearFromKeyUTC,
} from "../src/lib/format-date";

// Force a non-UTC process TZ to prove the formatters ignore local time.
const originalTZ = process.env.TZ;
beforeAll(() => {
  process.env.TZ = "America/Los_Angeles"; // UTC-7/-8
});
afterAll(() => {
  process.env.TZ = originalTZ;
});

describe("format-date UTC formatters", () => {
  describe("fmtMonthDayYearUTC", () => {
    it("formats 2025-10-06 as 'Oct 6, 2025'", () => {
      expect(fmtMonthDayYearUTC("2025-10-06")).toBe("Oct 6, 2025");
    });

    it("does not drift across timezones for date-only input", () => {
      // In LA, `new Date('2025-10-06')` parsed as UTC midnight is Oct 5 local.
      // The formatter must still return Oct 6.
      expect(fmtMonthDayYearUTC("2025-10-06")).toBe("Oct 6, 2025");
      expect(fmtMonthDayYearUTC("2025-01-01")).toBe("Jan 1, 2025");
      expect(fmtMonthDayYearUTC("2025-12-31")).toBe("Dec 31, 2025");
    });

    it("respects explicit timestamps with zone", () => {
      expect(fmtMonthDayYearUTC("2025-10-06T23:30:00Z")).toBe("Oct 6, 2025");
      // 2025-10-06T02:00:00-05:00 = 2025-10-06T07:00:00Z
      expect(fmtMonthDayYearUTC("2025-10-06T02:00:00-05:00")).toBe(
        "Oct 6, 2025",
      );
    });
  });

  describe("fmtMonthYearUTC", () => {
    it("formats 2025-10-06 as 'Oct 2025'", () => {
      expect(fmtMonthYearUTC("2025-10-06")).toBe("Oct 2025");
    });

    it("handles month boundaries deterministically", () => {
      expect(fmtMonthYearUTC("2025-01-01")).toBe("Jan 2025");
      expect(fmtMonthYearUTC("2025-12-31")).toBe("Dec 2025");
      // First-of-month in a negative offset would slip to prior month locally.
      expect(fmtMonthYearUTC("2025-11-01")).toBe("Nov 2025");
    });
  });

  describe("fmtMonthYearFromKeyUTC", () => {
    it("formats 'YYYY-MM' keys", () => {
      expect(fmtMonthYearFromKeyUTC("2025-10")).toBe("Oct 2025");
      expect(fmtMonthYearFromKeyUTC("2024-01")).toBe("Jan 2024");
      expect(fmtMonthYearFromKeyUTC("2026-12")).toBe("Dec 2026");
    });

    it("clamps out-of-range month indices", () => {
      expect(fmtMonthYearFromKeyUTC("2025-00")).toBe("Jan 2025");
      expect(fmtMonthYearFromKeyUTC("2025-13")).toBe("Dec 2025");
    });
  });
});
