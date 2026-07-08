// Retry OG image generation for slugs that failed or were never generated.
// Detects gaps in two ways:
//   1. Any feature id in src/data/features.ts with no public/og/features/{id}.png
//   2. Any slug listed in scripts/og-failures.json (written by generate-og-images.ts)
// Then regenerates ONLY that union set (skipping the exists-check gate so a
// zero-byte/truncated file from a prior failure gets overwritten).
// Run: LOVABLE_API_KEY=... bun run scripts/retry-og-images.ts
import { features } from "../src/data/features";
import { writeFile, mkdir, readFile, stat, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "public/og/features";
const FAILURES_PATH = "scripts/og-failures.json";
const MODEL = "openai/gpt-image-2";
const SIZE = "1536x1024";
const CONCURRENCY = 4;
const MIN_VALID_BYTES = 2048; // PNG smaller than this is almost certainly a bad write
const KEY = process.env.LOVABLE_API_KEY;
if (!KEY) throw new Error("LOVABLE_API_KEY missing");

await mkdir(OUT_DIR, { recursive: true });

function stylePrompt(f: (typeof features)[number]) {
  return [
    `Editorial magazine-cover style illustration for a software feature named "${f.name}".`,
    `Subject/mood: ${f.tagline} ${f.description.split(".")[0]}.`,
    `Category context: ${f.category}. Status: ${f.status}.`,
    `Aesthetic: minimal, dark-mode-first, cinematic depth, soft studio lighting, layered geometric abstraction, subtle 3D glass and metal forms, generous negative space, off-center composition.`,
    `Color palette strictly: deep ink #0A0A0A background, forest green #0B3D2E, emerald #1F7A5A glow accents, antique gold #C9A961 highlights, warm cream #FBF5E9 for highlights.`,
    `NO text, NO letters, NO logos, NO UI mockups, NO screenshots, NO icons. Pure abstract editorial art.`,
    `Refined, Stripe/Linear/Vercel marketing quality. Not crypto-bro, not neon, not purple, not glassmorphism cliché.`,
  ].join(" ");
}

async function fileIsUsable(path: string): Promise<boolean> {
  if (!existsSync(path)) return false;
  try {
    const s = await stat(path);
    return s.size >= MIN_VALID_BYTES;
  } catch {
    return false;
  }
}

async function readFailures(): Promise<Set<string>> {
  if (!existsSync(FAILURES_PATH)) return new Set();
  try {
    const raw = await readFile(FAILURES_PATH, "utf8");
    const arr = JSON.parse(raw) as Array<{ slug: string }>;
    return new Set(arr.map((x) => x.slug));
  } catch {
    return new Set();
  }
}

async function computeTargets(): Promise<(typeof features)[number][]> {
  const failures = await readFailures();
  const targets: (typeof features)[number][] = [];
  for (const f of features) {
    const out = join(OUT_DIR, `${f.id}.png`);
    const usable = await fileIsUsable(out);
    if (!usable || failures.has(f.id)) targets.push(f);
  }
  return targets;
}

async function generateOne(f: (typeof features)[number]) {
  const out = join(OUT_DIR, `${f.id}.png`);
  // Overwrite any partial/corrupt prior file.
  if (existsSync(out)) {
    try { await unlink(out); } catch { /* ignore */ }
  }

  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: stylePrompt(f),
      size: SIZE,
      quality: "low",
      n: 1,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("no b64_json in response");
  const buf = Buffer.from(b64, "base64");
  if (buf.length < MIN_VALID_BYTES) throw new Error(`payload too small: ${buf.length} bytes`);
  await writeFile(out, buf);
}

const queue = await computeTargets();
const total = queue.length;

if (total === 0) {
  console.log("✓ No missing or failed OG images. Nothing to retry.");
  // Clean up the failures file since everything is healthy.
  if (existsSync(FAILURES_PATH)) {
    await unlink(FAILURES_PATH).catch(() => {});
  }
  process.exit(0);
}

console.log(`Retrying ${total} OG image(s)…`);
const startedAt = Date.now();
let done = 0;
const remaining: Array<{ slug: string; err: string }> = [];

async function worker(id: number) {
  while (queue.length) {
    const f = queue.shift();
    if (!f) return;
    try {
      await generateOne(f);
      done++;
      const secs = Math.round((Date.now() - startedAt) / 1000);
      console.log(`[w${id}] ${done}/${total} ok   ${f.id}  (${secs}s)`);
    } catch (e) {
      const msg = (e as Error).message;
      remaining.push({ slug: f.id, err: msg });
      console.error(`[w${id}] FAIL ${f.id}: ${msg}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1)));

console.log(`\nRetry complete. ok=${done} still-failing=${remaining.length}`);

if (remaining.length) {
  await writeFile(FAILURES_PATH, JSON.stringify(remaining, null, 2));
  console.log(`Wrote ${FAILURES_PATH} with ${remaining.length} still-failing entries. Re-run to retry.`);
  process.exit(1);
} else if (existsSync(FAILURES_PATH)) {
  await unlink(FAILURES_PATH).catch(() => {});
  console.log(`Cleared ${FAILURES_PATH} (all resolved).`);
}
