/**
 * Feature Atlas ↔ Lovable changelog auditor.
 *
 * Runs in CI on every PR touching src/data/features.ts (or the script itself).
 * Fails the build on:
 *   1. Duplicate feature IDs in src/data/features.ts
 *   2. Duplicate normalized feature names in src/data/features.ts
 *   3. Confident date mismatches vs. https://docs.lovable.dev/changelog
 *      (only counted when a changelog entry title normalizes to exactly one
 *      feature name — ambiguous matches are reported as warnings, not fails).
 *
 * Warnings (do not fail the build):
 *   - Changelog entries with no matching feature (probably missing from the atlas)
 *   - Features whose name has no changelog match (nothing to compare against)
 *
 * Run locally:
 *   bun run scripts/audit-features-vs-changelog.ts
 */

import { features, type Feature } from "../src/data/features";

const CHANGELOG_URL = "https://docs.lovable.dev/changelog";

interface ChangelogEntry {
  title: string;
  date: string; // YYYY-MM-DD
}

// --- helpers -----------------------------------------------------------------

function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/\bconnector\b/g, "")
    .replace(/\bintegration\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseDate(text: string): string | null {
  // Accept "Jul 9, 2026", "July 9, 2026", "2026-07-09"
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const m = text.match(
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i
  );
  if (!m) return null;
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", sept: "09", oct: "10", nov: "11", dec: "12",
  };
  const mm = months[m[1].toLowerCase()];
  const dd = m[2].padStart(2, "0");
  return `${m[3]}-${mm}-${dd}`;
}

async function fetchChangelog(): Promise<ChangelogEntry[]> {
  const maxAttempts = 4;
  let lastErr: unknown;
  let html = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(CHANGELOG_URL, {
        headers: { "user-agent": "atlas-audit/1.0 (+dahlingdigital.com)" },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch changelog: ${res.status} ${res.statusText}`);
      }
      html = await res.text();
      if (html.length < 500) {
        throw new Error(`Changelog response suspiciously short (${html.length} bytes)`);
      }
      break;
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts) throw err;
      const backoff = 500 * 2 ** (attempt - 1);
      console.warn(`Changelog fetch attempt ${attempt} failed: ${(err as Error).message}. Retrying in ${backoff}ms...`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  if (!html) throw (lastErr instanceof Error ? lastErr : new Error("Empty changelog response"));

  // Strip tags, keep line breaks so we can associate dates with nearby titles.
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(h[1-6]|li|p|div|section|article|header)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ");

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const entries: ChangelogEntry[] = [];
  let currentDate: string | null = null;

  for (const line of lines) {
    const maybeDate = parseDate(line);
    // A "date header" line is short and is mostly the date string itself.
    if (maybeDate && line.length <= 40) {
      currentDate = maybeDate;
      continue;
    }
    if (!currentDate) continue;
    if (line.length < 3 || line.length > 160) continue;
    // Skip obvious nav/boilerplate
    if (/^(Search|Menu|Skip|On this page|Copy page|Ask AI)$/i.test(line)) continue;
    entries.push({ title: line, date: currentDate });
  }

  return entries;
}

// --- audit -------------------------------------------------------------------

interface AuditReport {
  duplicateIds: string[];
  duplicateNames: Array<{ normalized: string; ids: string[] }>;
  dateMismatches: Array<{
    id: string;
    name: string;
    atlasDate: string;
    changelogDate: string;
  }>;
  unmatchedFeatures: number;
  ambiguousMatches: Array<{ id: string; candidates: string[] }>;
}

function audit(all: Feature[], changelog: ChangelogEntry[]): AuditReport {
  // 1. Duplicate IDs
  const idSeen = new Map<string, number>();
  for (const f of all) idSeen.set(f.id, (idSeen.get(f.id) ?? 0) + 1);
  const duplicateIds = [...idSeen.entries()].filter(([, n]) => n > 1).map(([id]) => id);

  // 2. Duplicate names
  const nameGroups = new Map<string, string[]>();
  for (const f of all) {
    const key = normalizeName(f.name);
    if (!key) continue;
    const arr = nameGroups.get(key) ?? [];
    arr.push(f.id);
    nameGroups.set(key, arr);
  }
  const duplicateNames = [...nameGroups.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([normalized, ids]) => ({ normalized, ids }));

  // 3. Date mismatches — build a normalized index of the changelog.
  // For each normalized title, collect the set of unique dates it appears on.
  const changelogIndex = new Map<string, Set<string>>();
  for (const entry of changelog) {
    const key = normalizeName(entry.title);
    if (!key) continue;
    const set = changelogIndex.get(key) ?? new Set<string>();
    set.add(entry.date);
    changelogIndex.set(key, set);
  }

  const dateMismatches: AuditReport["dateMismatches"] = [];
  const ambiguousMatches: AuditReport["ambiguousMatches"] = [];
  let unmatched = 0;

  for (const f of all) {
    const key = normalizeName(f.name);
    const dates = changelogIndex.get(key);
    if (!dates || dates.size === 0) {
      unmatched++;
      continue;
    }
    if (dates.size > 1) {
      ambiguousMatches.push({ id: f.id, candidates: [...dates] });
      continue;
    }
    const [changelogDate] = [...dates];
    if (changelogDate !== f.releaseDate) {
      dateMismatches.push({
        id: f.id,
        name: f.name,
        atlasDate: f.releaseDate,
        changelogDate,
      });
    }
  }

  return {
    duplicateIds,
    duplicateNames,
    dateMismatches,
    unmatchedFeatures: unmatched,
    ambiguousMatches,
  };
}

// --- main --------------------------------------------------------------------

async function main() {
  console.log(`Loaded ${features.length} features from src/data/features.ts`);
  console.log(`Fetching ${CHANGELOG_URL} ...`);
  const changelog = await fetchChangelog();
  console.log(`Parsed ${changelog.length} changelog entries.`);

  const report = audit(features, changelog);

  const hardFail =
    report.duplicateIds.length > 0 ||
    report.duplicateNames.length > 0 ||
    report.dateMismatches.length > 0;

  console.log("\n=== Feature Atlas Audit ===");
  console.log(`Duplicate IDs:            ${report.duplicateIds.length}`);
  console.log(`Duplicate names:          ${report.duplicateNames.length}`);
  console.log(`Confident date mismatches: ${report.dateMismatches.length}`);
  console.log(`Ambiguous (multi-date):    ${report.ambiguousMatches.length}`);
  console.log(`Features with no changelog match: ${report.unmatchedFeatures}`);

  if (report.duplicateIds.length) {
    console.log("\n❌ Duplicate IDs:");
    for (const id of report.duplicateIds) console.log(`  - ${id}`);
  }
  if (report.duplicateNames.length) {
    console.log("\n❌ Duplicate normalized names:");
    for (const d of report.duplicateNames) {
      console.log(`  - "${d.normalized}" → ${d.ids.join(", ")}`);
    }
  }
  if (report.dateMismatches.length) {
    console.log("\n❌ Date mismatches (atlas vs. changelog):");
    for (const m of report.dateMismatches) {
      console.log(`  - ${m.id} (${m.name}): atlas=${m.atlasDate} changelog=${m.changelogDate}`);
    }
  }
  if (report.ambiguousMatches.length && process.env.VERBOSE) {
    console.log("\n⚠️  Ambiguous matches (not failing):");
    for (const a of report.ambiguousMatches) {
      console.log(`  - ${a.id}: [${a.candidates.join(", ")}]`);
    }
  }

  if (hardFail) {
    console.error("\nAudit FAILED. Fix the issues above before merging.");
    process.exit(1);
  }
  console.log("\n✅ Audit passed.");
}

main().catch((err) => {
  console.error("Audit script crashed:", err);
  process.exit(1);
});
