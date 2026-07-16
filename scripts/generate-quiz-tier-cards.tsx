// Pre-render the six quiz tier cards as OG images (1200x630 PNG) to
// public/og/quiz/{tier-slug}.png, using the REAL QuizTarotCard component so
// the shared-link preview is pixel-identical to the card users generate.
//
// Run: bun run scripts/generate-quiz-tier-cards.tsx
// Fonts: pass TTF paths via FONT_DIR (default /tmp/atlas-fonts) — JetBrains
// Mono and Geist static instances downloaded from Google Fonts.

import { renderToStaticMarkup } from "react-dom/server";
import { writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { QuizTarotCard } from "../src/components/atlas/QuizTarotCard";
import { TIERS } from "../src/lib/tiers";

const OUT_DIR = "public/og/quiz";
const FONT_DIR = process.env.FONT_DIR ?? "/tmp/atlas-fonts";

export function tierSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

await mkdir(OUT_DIR, { recursive: true });

const fontFiles = (await readdir(FONT_DIR))
  .filter((f) => f.endsWith(".ttf"))
  .map((f) => join(FONT_DIR, f));
if (fontFiles.length === 0) throw new Error(`No TTFs in ${FONT_DIR}`);

for (const tier of TIERS) {
  // Tier-level card: range instead of a literal score, blurb as the line.
  const markup = renderToStaticMarkup(
    <QuizTarotCard
      count={0}
      total={40}
      tier={tier.name}
      orientation="landscape"
      scoreText={tier.blurb}
      pctText={`${tier.min}\u2013${tier.max}%`}
    />,
  );
  const svg = markup.startsWith("<svg")
    ? markup.replace("<svg", '<svg width="1200" height="630"')
    : markup;

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontFiles,
      loadSystemFonts: false,
      defaultFontFamily: "Geist",
    },
    background: "#0A0A0A",
  });
  const png = resvg.render().asPng();
  const out = join(OUT_DIR, `${tierSlug(tier.name)}.png`);
  await writeFile(out, png);
  console.log(`✓ ${out} (${(png.length / 1024).toFixed(0)} KB)`);
}

console.log("Done.");
