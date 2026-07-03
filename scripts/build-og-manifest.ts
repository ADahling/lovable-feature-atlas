// Build (or refresh) SHA-256 manifest for social images.
// Covers public/og-image.png + every public/og/features/*.png.
// Usage: bun run scripts/build-og-manifest.ts
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

const MANIFEST = "tests/__og_baselines__/manifest.json";
const ROOT_OG = "public/og-image.png";
const FEATURES_DIR = "public/og/features";

async function sha256(path: string) {
  const buf = await readFile(path);
  return createHash("sha256").update(buf).digest("hex");
}

async function safeList(dir: string) {
  try {
    const entries = await readdir(dir);
    return entries.filter((f) => f.endsWith(".png")).sort();
  } catch {
    return [];
  }
}

const files: string[] = [];
try { await stat(ROOT_OG); files.push(ROOT_OG); } catch {}
for (const f of await safeList(FEATURES_DIR)) files.push(join(FEATURES_DIR, f));

const entries: Record<string, { sha256: string; size: number }> = {};
for (const path of files) {
  const [hash, s] = await Promise.all([sha256(path), stat(path)]);
  entries[path] = { sha256: hash, size: s.size };
}

await mkdir("tests/__og_baselines__", { recursive: true });
await writeFile(
  MANIFEST,
  JSON.stringify(
    { generatedAt: new Date().toISOString(), count: files.length, entries },
    null,
    2,
  ) + "\n",
);
console.log(`Wrote ${MANIFEST} with ${files.length} entries.`);
