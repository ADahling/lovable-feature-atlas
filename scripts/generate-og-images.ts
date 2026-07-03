// Batch-generate per-feature OG images to public/og/features/{slug}.png
// Run: LOVABLE_API_KEY=... bun run scripts/generate-og-images.ts
import { features } from "../src/data/features";
import { writeFile, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = "public/og/features";
const MODEL = "openai/gpt-image-2";
const SIZE = "1536x1024";
const CONCURRENCY = 4;
const KEY = process.env.LOVABLE_API_KEY;
if (!KEY) throw new Error("LOVABLE_API_KEY missing");

await mkdir(OUT_DIR, { recursive: true });

function stylePrompt(f: (typeof features)[number]) {
  // Editorial, brand-aligned OG art. No text (text via image models is unreliable).
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

async function exists(p: string) {
  try { await stat(p); return true; } catch { return false; }
}

async function generateOne(f: (typeof features)[number]) {
  const out = join(OUT_DIR, `${f.id}.png`);
  if (await exists(out)) return { slug: f.id, skipped: true };

  const body = {
    model: MODEL,
    prompt: stylePrompt(f),
    size: SIZE,
    quality: "low",
    n: 1,
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`[${f.id}] HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error(`[${f.id}] no b64_json in response`);
  await writeFile(out, Buffer.from(b64, "base64"));
  return { slug: f.id, skipped: false };
}

const queue = [...features];
let done = 0;
let failed = 0;
const failures: Array<{ slug: string; err: string }> = [];
const total = queue.length;
const startedAt = Date.now();

async function worker(id: number) {
  while (queue.length) {
    const f = queue.shift();
    if (!f) return;
    try {
      const r = await generateOne(f);
      done++;
      const secs = Math.round((Date.now() - startedAt) / 1000);
      console.log(`[w${id}] ${done}/${total} ${r.skipped ? "skip" : "ok"}  ${f.id}  (${secs}s)`);
    } catch (e) {
      failed++;
      const msg = (e as Error).message;
      failures.push({ slug: f.id, err: msg });
      console.error(`[w${id}] FAIL ${f.id}: ${msg}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1)));

console.log(`\nDONE. total=${total} ok=${done - 0} failed=${failed}`);
if (failures.length) {
  await writeFile("scripts/og-failures.json", JSON.stringify(failures, null, 2));
  console.log(`Wrote scripts/og-failures.json (${failures.length} entries)`);
}
