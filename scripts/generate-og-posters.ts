/**
 * Deterministic poster-style OG images — no AI, no credits, reproducible.
 *
 * Composes public/og/features/{id}.png (1536x1024, matching the per-feature
 * og:image:width/height tags) for EVERY bundled feature: the gilded
 * constellation base plate + genre overline in the category accent +
 * Fraunces title + premiere/rating strip.
 *
 * Run:  SHARP_PATH=<path-to-sharp> bun run scripts/generate-og-posters.ts
 *       (or plain `bun run …` when sharp is resolvable from the repo)
 * Then: bun run og:baseline   # rewrite the integrity manifest + slug list
 *
 * Fonts: expects "Fraunces 144pt" (SemiBold) and "IBM Plex Mono"
 * (Medium/SemiBold) to be installed for fontconfig (e.g. ~/.fonts).
 */
import { features } from "../src/data/features";
import { accentForCategory } from "../src/lib/category-theme";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const sharpModule = await import(process.env.SHARP_PATH ?? "sharp");
const sharp = sharpModule.default ?? sharpModule;

const OUT_DIR = join(import.meta.dir, "..", "public", "og", "features");
const BASE = join(import.meta.dir, "..", "public", "art", "og-poster-base.jpg");
const W = 1536;
const H = 1024;

const INK = "#221D12";
const GOLD_DEEP = "#A67C00";
const GOLD_TEXT = "#6B5423";

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso)
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
      .toUpperCase();
  } catch {
    return iso;
  }
}

/** Greedy word-wrap into at most `maxLines`, balanced-ish. */
function wrapTitle(name: string, maxChars: number, maxLines: number): string[] {
  const words = name.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s+\S*$/, "") + "…";
    return kept;
  }
  return lines;
}

function posterSvg(feature: (typeof features)[number]): string {
  const accent = accentForCategory(feature.category, "light");
  const rating =
    feature.status === "GA"
      ? "RATED GA"
      : feature.status === "Beta"
        ? "RATED BETA"
        : "RETIRED";

  // Title sizing: shrink with length, wrap to at most 3 lines.
  const name = feature.name;
  let fontSize = 104;
  if (name.length > 34) fontSize = 88;
  if (name.length > 52) fontSize = 74;
  if (name.length > 74) fontSize = 64;
  const maxChars = Math.floor(1300 / (fontSize * 0.52));
  const lines = wrapTitle(name, maxChars, 3);
  const lineHeight = fontSize * 1.12;
  const titleBlockH = lines.length * lineHeight;
  const titleTop = H / 2 - titleBlockH / 2 + fontSize * 0.36;

  const titleSpans = lines
    .map(
      (line, i) =>
        `<text x="${W / 2}" y="${(titleTop + i * lineHeight).toFixed(1)}" text-anchor="middle" font-family="Fraunces 144pt" font-weight="600" font-size="${fontSize}" fill="${INK}">${esc(line)}</text>`,
    )
    .join("\n  ");

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- top wordmark -->
  <text x="${W / 2}" y="96" text-anchor="middle" font-family="IBM Plex Mono" font-weight="600" font-size="26" letter-spacing="8" fill="${GOLD_TEXT}">THE LOVABLE FEATURE ATLAS</text>
  <rect x="${W / 2 - 260}" y="122" width="520" height="2" fill="${GOLD_DEEP}" fill-opacity="0.55"/>
  <!-- genre -->
  <text x="${W / 2}" y="${(titleTop - lineHeight - 6).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Mono" font-weight="600" font-size="30" letter-spacing="9" fill="${accent}">${esc(feature.category.toUpperCase())}</text>
  <!-- title -->
  ${titleSpans}
  <!-- premiere strip -->
  <rect x="${W / 2 - 260}" y="${H - 178}" width="520" height="2" fill="${GOLD_DEEP}" fill-opacity="0.55"/>
  <text x="${W / 2}" y="${H - 128}" text-anchor="middle" font-family="IBM Plex Mono" font-weight="500" font-size="28" letter-spacing="7" fill="${INK}" fill-opacity="0.82">PREMIERED ${esc(fmtDate(feature.releaseDate))}</text>
  <text x="${W / 2}" y="${H - 78}" text-anchor="middle" font-family="IBM Plex Mono" font-weight="600" font-size="26" letter-spacing="8" fill="${GOLD_TEXT}">${rating} · ATLAS.DAHLINGDIGITAL.COM</text>
</svg>`;
}

mkdirSync(OUT_DIR, { recursive: true });
let done = 0;
const queue = [...features];
const CONCURRENCY = 8;

async function worker(): Promise<void> {
  for (;;) {
    const feature = queue.shift();
    if (!feature) return;
    const svg = Buffer.from(posterSvg(feature));
    await sharp(BASE)
      .composite([{ input: svg }])
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toFile(join(OUT_DIR, `${feature.id}.png`));
    done++;
    if (done % 50 === 0) console.log(`${done}/${features.length}`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`done: ${done} posters`);
