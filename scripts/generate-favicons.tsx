// Generate the favicon set from the canonical Atlas heart (heart-path.ts):
// public/favicon.svg, favicon-16.png, favicon-32.png, apple-touch-icon.png
// (180), icon-512.png, and a multi-size favicon.ico (PNG-encoded entries).
//
// Run: bun run scripts/generate-favicons.tsx
// Per src/lib/heart-path.ts, every heart in the product must derive from
// HEART_PATH_D — this replaces the old placeholder data-URI icon whose
// silhouette did not match the brand.

import { writeFile, mkdir } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import { HEART_PATH_D } from "../src/lib/heart-path";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F5E4B5"/>
      <stop offset="0.45" stop-color="#C9A961"/>
      <stop offset="1" stop-color="#8C7433"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="#0A0A0A"/>
  <g transform="translate(32 33) scale(0.86) translate(-32 -32)">
    <path d="${HEART_PATH_D}" fill="url(#foil)"/>
  </g>
</svg>`;

await mkdir("public", { recursive: true });
await writeFile("public/favicon.svg", SVG);
console.log("✓ public/favicon.svg");

function renderPng(size: number): Buffer {
  const r = new Resvg(SVG, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: false },
  });
  return r.render().asPng();
}

const outputs: Array<[string, number]> = [
  ["public/favicon-16.png", 16],
  ["public/favicon-32.png", 32],
  ["public/apple-touch-icon.png", 180],
  ["public/icon-512.png", 512],
];
const pngBySize = new Map<number, Buffer>();
for (const [path, size] of outputs) {
  const png = renderPng(size);
  pngBySize.set(size, png);
  await writeFile(path, png);
  console.log(`✓ ${path} (${(png.length / 1024).toFixed(1)} KB)`);
}

// Minimal ICO container with PNG-encoded images (supported since Vista).
function buildIco(entries: Array<{ size: number; png: Buffer }>): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  const dirs: Buffer[] = [];
  const blobs: Buffer[] = [];
  let offset = 6 + entries.length * 16;
  for (const { size, png } of entries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    dir.writeUInt8(size >= 256 ? 0 : size, 1); // height
    dir.writeUInt8(0, 2); // palette
    dir.writeUInt8(0, 3); // reserved
    dir.writeUInt16LE(1, 4); // color planes
    dir.writeUInt16LE(32, 6); // bits per pixel
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += png.length;
    dirs.push(dir);
    blobs.push(png);
  }
  return Buffer.concat([header, ...dirs, ...blobs]);
}

const icoSizes = [16, 32, 48];
const icoEntries = icoSizes.map((size) => ({
  size,
  png: pngBySize.get(size) ?? renderPng(size),
}));
const ico = buildIco(icoEntries);
await writeFile("public/favicon.ico", ico);
console.log(`✓ public/favicon.ico (${(ico.length / 1024).toFixed(1)} KB)`);
console.log("Done.");
