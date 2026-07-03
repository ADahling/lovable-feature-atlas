// Fails if any committed social image drifts from its baseline hash,
// if a baselined image is missing, or if new images are present without
// a baseline. Refresh baselines with: bun run og:baseline
import { describe, it, expect } from "vitest";
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

describe("OG image integrity", () => {
  it("has a committed baseline manifest", () => {
    expect(existsSync(MANIFEST_PATH), `Missing ${MANIFEST_PATH}. Run: bun run og:baseline`).toBe(true);
  });

  it("every image on disk matches its baseline hash", async () => {
    if (!existsSync(MANIFEST_PATH)) return;
    const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as Manifest;
    const actual = await listActualImages();
    const drift: string[] = [];
    const missing: string[] = [];
    const unlisted: string[] = [];

    const baselined = new Set(Object.keys(manifest.entries));
    for (const path of actual) {
      const expected = manifest.entries[path];
      if (!expected) { unlisted.push(path); continue; }
      const [hash, s] = await Promise.all([sha256(path), stat(path)]);
      if (hash !== expected.sha256 || s.size !== expected.size) {
        drift.push(`${path}: sha256 ${hash.slice(0, 12)} vs baseline ${expected.sha256.slice(0, 12)}`);
      }
      baselined.delete(path);
    }
    for (const path of baselined) {
      if (!existsSync(path)) missing.push(path);
    }

    const lines: string[] = [];
    if (drift.length) lines.push(`Changed images (${drift.length}):\n  ` + drift.join("\n  "));
    if (missing.length) lines.push(`Missing images (${missing.length}):\n  ` + missing.join("\n  "));
    if (unlisted.length) lines.push(`Unbaselined images (${unlisted.length}):\n  ` + unlisted.join("\n  "));
    if (lines.length) {
      lines.push("\nIf the change was intentional, refresh baselines with: bun run og:baseline");
    }
    expect(lines.join("\n\n"), "OG images drifted from committed baselines").toBe("");
  }, 60_000);
});
