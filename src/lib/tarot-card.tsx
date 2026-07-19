/**
 * Shared tarot-card language used by /draw, /quiz, and the "Draw this as
 * a card" action on feature detail pages. Everything visual (frame,
 * filigree, gold gradient, heart mark, category glyph, back pattern) is
 * defined here so all three surfaces stay in perfect visual sync.
 *
 * Rendered as SVG so we can rasterize to high-res PNG for download by
 * serializing the DOM element (see svgToPngUrl / svgMarkupToPngUrl).
 */
import * as React from "react";
import { iconForCategory } from "./category-icons";
import { HEART_PATH_D } from "./heart-path";

// ---------- palette (literal — canvas can't read CSS vars) ----------
const INK = "#0A0A0A";
export const FOREST = "#0B3D2E";
export const EMERALD = "#1F7A5A";
export const GOLD = "#C9A961";
export const CREAM = "#FBF5E9";

// ---------- helpers ----------

export function toRoman(n: number): string {
  if (n < 1) return "0";
  const map: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let x = n;
  for (const [v, s] of map) {
    while (x >= v) { out += s; x -= v; }
  }
  return out;
}

export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = (text ?? "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= maxChars) cur += " " + w;
    else {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  const joined = lines.join(" ");
  const full = words.join(" ");
  if (full.length > joined.length && lines.length === maxLines) {
    lines[lines.length - 1] =
      lines[lines.length - 1].replace(/\s+\S+$/, "") + "…";
  }
  return lines;
}

/**
 * Auto-fit a title into up to `maxLines` lines by trying progressively
 * looser (maxChars, size, lineHeight) tries. Returns the first try whose
 * wrap covers the full string without truncation. If no try fits, the
 * loosest try wins and remaining words are packed into the final line
 * without ellipsis — an exported feature-name card must never drop
 * characters, even if a single line visually overflows.
 */
export interface FitTry {
  maxChars: number;
  size: number;
  lineHeight: number;
}

export interface FitTitleResult {
  lines: string[];
  size: number;
  lineHeight: number;
}

export function fitTitle(
  text: string,
  tries: FitTry[],
  maxLines: number,
): FitTitleResult {
  const full = (text ?? "").split(/\s+/).filter(Boolean).join(" ");
  for (const t of tries) {
    const lines = wrapTextNoTruncate(text, t.maxChars, maxLines);
    if (lines.join(" ").length >= full.length) {
      return { lines, size: t.size, lineHeight: t.lineHeight };
    }
  }
  const last = tries[tries.length - 1];
  return {
    lines: wrapTextNoTruncate(text, last.maxChars, maxLines),
    size: last.size,
    lineHeight: last.lineHeight,
  };
}

/** Wrap without ever appending an ellipsis; packs overflow into the last line. */
function wrapTextNoTruncate(text: string, maxChars: number, maxLines: number): string[] {
  const words = (text ?? "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= maxChars) cur += " " + w;
    else if (lines.length < maxLines - 1) {
      lines.push(cur);
      cur = w;
    } else {
      cur += " " + w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}


// Stable, small, positive index derived from a string (for feature roman numerals).
export function indexFromId(id: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h % 999) + 1;
}

// ---------- shared SVG defs + frame ----------

const DEFS_ID_SUFFIX = "-tc"; // keep IDs unique per instance if ever inlined together

export function TarotDefs({ uid = "" }: { uid?: string }) {
  const s = uid || DEFS_ID_SUFFIX;
  return (
    <defs>
      <linearGradient id={`tcbg${s}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={INK} />
        <stop offset="100%" stopColor="#0B1512" />
      </linearGradient>
      <radialGradient id={`tcsheen${s}`} cx="0.5" cy="0.42" r="0.6">
        <stop offset="0%" stopColor={EMERALD} stopOpacity="0.35" />
        <stop offset="55%" stopColor={FOREST} stopOpacity="0.12" />
        <stop offset="100%" stopColor={INK} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`tcgold${s}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E4C784" />
        <stop offset="50%" stopColor={GOLD} />
        <stop offset="100%" stopColor="#8C7433" />
      </linearGradient>
      <radialGradient id={`tcback${s}`} cx="0.5" cy="0.5" r="0.6">
        <stop offset="0%" stopColor={EMERALD} stopOpacity="0.28" />
        <stop offset="100%" stopColor={INK} stopOpacity="0" />
      </radialGradient>
      <pattern
        id={`tcdots${s}`}
        x="0"
        y="0"
        width="14"
        height="14"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="1" cy="1" r="0.6" fill={GOLD} fillOpacity="0.14" />
      </pattern>
    </defs>
  );
}

export interface TarotFrameProps {
  w: number;
  h: number;
  radius?: number;
  faceUp?: boolean;
  uid?: string;
  /** Bottom-center mark text (small mono, gold at low opacity). */
  footer?: string;
  children?: React.ReactNode;
}

/**
 * Card body + double gold frame + corner filigree. Renders into an
 * existing <svg>; caller provides the outer <svg> element so we can also
 * embed multiple cards side by side (portrait/landscape variants share
 * frame + filigree math).
 */
export function TarotFrame({
  w,
  h,
  radius = 34,
  faceUp = true,
  uid = "",
  footer,
  children,
}: TarotFrameProps) {
  const s = uid || DEFS_ID_SUFFIX;
  const inset = 18;
  const inset2 = 34;
  const cornerR = 26;
  const corners: Array<[number, number, number, number]> = [
    [46, 46, 1, 1],
    [w - 46, 46, -1, 1],
    [46, h - 46, 1, -1],
    [w - 46, h - 46, -1, -1],
  ];
  return (
    <>
      <rect x="0" y="0" width={w} height={h} rx={radius} ry={radius} fill={`url(#tcbg${s})`} />
      <rect
        x="0"
        y="0"
        width={w}
        height={h}
        rx={radius}
        ry={radius}
        fill={faceUp ? `url(#tcsheen${s})` : `url(#tcback${s})`}
      />
      <rect x="0" y="0" width={w} height={h} rx={radius} ry={radius} fill={`url(#tcdots${s})`} />

      {/* Ornate double gold frame */}
      <rect
        x={inset}
        y={inset}
        width={w - inset * 2}
        height={h - inset * 2}
        rx={radius - 10}
        ry={radius - 10}
        fill="none"
        stroke={`url(#tcgold${s})`}
        strokeWidth="2.5"
      />
      <rect
        x={inset2}
        y={inset2}
        width={w - inset2 * 2}
        height={h - inset2 * 2}
        rx={radius - 16}
        ry={radius - 16}
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.45"
        strokeWidth="0.75"
      />

      {/* Corner filigree */}
      {corners.map(([cx, cy, sx, sy], i) => (
        <g
          key={i}
          transform={`translate(${cx} ${cy}) scale(${sx} ${sy})`}
          fill="none"
          stroke={GOLD}
          strokeOpacity="0.7"
          strokeWidth="1.2"
        >
          <path d={`M0 ${cornerR} Q0 0 ${cornerR} 0`} />
          <path d={`M6 ${cornerR} Q6 6 ${cornerR} 6`} strokeOpacity="0.35" />
          <circle cx="12" cy="12" r="1.6" fill={GOLD} stroke="none" />
        </g>
      ))}

      {children}

      {footer && (
        <text
          x={w / 2}
          y={h - 42}
          textAnchor="middle"
          fontFamily="'IBM Plex Mono', ui-monospace, monospace"
          fontSize="11"
          fill={CREAM}
          fillOpacity="0.4"
          letterSpacing="3"
        >
          {footer}
        </text>
      )}
    </>
  );
}

// ---------- shared symbols ----------

/**
 * Site heart mark rendered as a filled path — uses the canonical Atlas
 * silhouette from src/lib/heart-path.ts (authored on a 64x64 grid, here
 * scaled to fit a `size`x`size` box centered around origin). Caller
 * wraps in a <g transform="translate(...)">. Material is engraved gold
 * on card stock — the silhouette matches the 3D hero heart exactly.
 */
export function HeartMark({
  size = 100,
  uid = "",
  stroke = true,
}: {
  size?: number;
  uid?: string;
  stroke?: boolean;
}) {
  const s = uid || DEFS_ID_SUFFIX;
  const scale = size / 64;
  return (
    <g transform={`scale(${scale})`}>
      <path
        d={HEART_PATH_D}
        fill={`url(#tcgold${s})`}
        stroke={stroke ? GOLD : "none"}
        strokeWidth={0.6}
      />
    </g>
  );
}

/**
 * Category arcana glyph — outlined lucide icon on an emerald aura ring.
 * Rendered to fit inside a `radius`-sized circle centered at (cx, cy).
 */
export function CategoryArcana({
  category,
  cx,
  cy,
  radius,
}: {
  category: string;
  cx: number;
  cy: number;
  radius: number;
}) {
  const Icon = iconForCategory(category);
  const iconSize = Math.round(radius * 1.25);
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={radius * 1.18} fill={EMERALD} fillOpacity="0.14" />
      <circle
        r={radius * 0.94}
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      <circle
        r={radius * 0.82}
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.55"
        strokeWidth="0.6"
        strokeDasharray="2 4"
      />
      <g transform={`translate(${-iconSize / 2} ${-iconSize / 2})`}>
        <Icon size={iconSize} strokeWidth={1.2} stroke={GOLD} fill="none" />
      </g>
    </g>
  );
}

/**
 * Face-down medallion pattern shared by all deck backs.
 */
export function DeckBackMedallion({
  cx,
  cy,
  scale = 1,
  uid = "",
}: {
  cx: number;
  cy: number;
  scale?: number;
  uid?: string;
}) {
  const s = uid || DEFS_ID_SUFFIX;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      <circle r="180" fill="none" stroke={GOLD} strokeOpacity="0.55" strokeWidth="1" />
      <circle
        r="150"
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.4"
        strokeWidth="0.6"
        strokeDasharray="1 5"
      />
      <circle r="120" fill="none" stroke={GOLD} strokeOpacity="0.55" strokeWidth="0.8" />
      <circle r="60" fill={EMERALD} fillOpacity="0.18" />
      <g transform="translate(-42 -42)">
        <g transform="scale(0.84)">
          <HeartMark size={100} uid={s} />
        </g>
      </g>
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={Math.cos(a) * 200}
            y1={Math.sin(a) * 200}
            x2={Math.cos(a) * 240}
            y2={Math.sin(a) * 240}
            stroke={GOLD}
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        );
      })}
    </g>
  );
}

// ---------- rasterization ----------

async function drawSvgSourceToPng(
  source: string,
  width: number,
  height: number,
  scale: number,
): Promise<string> {
  const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("svg load failed"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Rasterize a mounted <svg> element to a PNG data URL. */
export async function svgToPngUrl(svg: SVGSVGElement, scale = 2): Promise<string> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  // Derive width/height from viewBox if the element uses responsive sizing.
  const vb = (clone.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
  const w = vb[2] || svg.clientWidth || 1000;
  const h = vb[3] || svg.clientHeight || 1000;
  const source = new XMLSerializer().serializeToString(clone);
  return drawSvgSourceToPng(source, w, h, scale);
}

/**
 * Rasterize an SVG markup string (e.g. from renderToStaticMarkup) to a
 * PNG data URL. Used by ShareBar's "Draw as card" flow so we don't have
 * to mount the SVG into the live DOM.
 */
export async function svgMarkupToPngUrl(
  markup: string,
  width: number,
  height: number,
  scale = 2,
): Promise<string> {
  // Ensure xmlns is set (renderToStaticMarkup already emits it for <svg>,
  // but be defensive).
  const source = markup.includes("xmlns=")
    ? markup
    : markup.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  return drawSvgSourceToPng(source, width, height, scale);
}
