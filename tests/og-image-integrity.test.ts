// Fails if any committed social image (public/og-image.png OR any
// public/og/features/*.png) drifts from its baseline in
// tests/__og_baselines__/manifest.json (sha256 + byte size — a stricter
// superset of pixel-diff: any pixel change changes the hash).
//
// Each baselined image is asserted as its own test case so per-page drift
// is visible in the report, not hidden inside a single aggregate assertion.
// Refresh baselines with: bun run og:baseline
import { describe, it, expect, beforeAll } from "vitest";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const MANIFEST_PATH = "tests/__og_baselines__/manifest.json";
const ROOT_OG = "public/og-image.png";
const FEATURES_DIR = "public/og/features";

type Manifest = {
  entries: Record<string, { sha256: string; size: number }>;
};

async function sha256(path: string) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function listActualImages(): Promise<string[]> {
  const out: string[] = [];
  if (existsSync(ROOT_OG)) out.push(ROOT_OG);
  try {
    const entries = await readdir(FEATURES_DIR);
    for (const f of entries.sort()) {
      if (f.endsWith(".png")) out.push(join(FEATURES_DIR, f));
    }
  } catch { /* dir may not exist yet */ }
  return out;
}

let manifest: Manifest = { entries: {} };
let actualImages: string[] = [];

beforeAll(async () => {
  if (existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as Manifest;
  }
  actualImages = await listActualImages();
});

describe("OG image integrity", () => {
  it("has a committed baseline manifest", () => {
    expect(existsSync(MANIFEST_PATH), `Missing ${MANIFEST_PATH}. Run: bun run og:baseline`).toBe(true);
  });

  it("baseline set covers all images on disk (no unbaselined additions)", () => {
    const baselined = new Set(Object.keys(manifest.entries));
    const unlisted = actualImages.filter((p) => !baselined.has(p));
    expect(
      unlisted,
      `Images present on disk without a baseline entry. Run: bun run og:baseline\n  ${unlisted.join("\n  ")}`,
    ).toEqual([]);
  });

  it("no baselined image is missing from disk", () => {
    const missing = Object.keys(manifest.entries).filter((p) => !existsSync(p));
    expect(
      missing,
      `Baselined images missing from disk:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });

  describe("root og-image.png matches its baseline", () => {
    it(ROOT_OG, async () => {
      if (!existsSync(ROOT_OG)) return; // covered by missing check above
      const expected = manifest.entries[ROOT_OG];
      expect(expected, `${ROOT_OG} not in manifest`).toBeDefined();
      const [hash, s] = await Promise.all([sha256(ROOT_OG), stat(ROOT_OG)]);
      expect(
        { sha256: hash, size: s.size },
        `${ROOT_OG} drifted. Refresh with: bun run og:baseline`,
      ).toEqual({ sha256: expected!.sha256, size: expected!.size });
    });
  });

  // Per-page feature OG images: one test per file so per-page drift is
  // reported individually in CI, not collapsed into a single failure.
  describe("per-page feature OG images match their baselines", () => {
    const baselineFeatureImages = existsSync(MANIFEST_PATH)
      ? (() => {
          const raw = JSON.parse(require("node:fs").readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
          return Object.keys(raw.entries)
            .filter((p) => p.startsWith(`${FEATURES_DIR}/`) && p.endsWith(".png"))
            .sort();
        })()
      : [];

    it("at least one per-feature baseline exists", () => {
      expect(baselineFeatureImages.length).toBeGreaterThan(0);
    });

    it.each(baselineFeatureImages)("%s", async (path) => {
      if (!existsSync(path)) return; // reported by missing check above
      const expected = manifest.entries[path];
      const [hash, s] = await Promise.all([sha256(path), stat(path)]);
      expect(
        { sha256: hash, size: s.size },
        `${path} drifted from baseline. If intentional: bun run og:baseline`,
      ).toEqual({ sha256: expected.sha256, size: expected.size });
    }, 15_000);
  });
});
