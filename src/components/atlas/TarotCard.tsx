import { forwardRef, useMemo } from "react";
import { iconForCategory } from "../../lib/category-icons";
import type { Feature } from "../../data/features";

// Tarot proportions: 2:3.5. Use 700 x 1225 viewBox.
export const CARD_W = 700;
export const CARD_H = 1225;

function toRoman(n: number): string {
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

interface TarotCardProps {
  feature: Feature;
  index: number; // 1-based index for roman numeral
  faceUp: boolean;
  className?: string;
}

/**
 * Ornate tarot card face rendered as inline SVG so the same markup can be
 * serialized to a high-res PNG for the "Keep this card" download.
 * Palette is strictly ink/forest/emerald/gold/cream — no new colors.
 */
export const TarotCard = forwardRef<SVGSVGElement, TarotCardProps>(function TarotCard(
  { feature, index, faceUp, className = "" },
  ref,
) {
  const Icon = useMemo(() => iconForCategory(feature.category), [feature.category]);
  const roman = toRoman(index);

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${CARD_W} ${CARD_H}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={faceUp ? `${feature.name} — ${feature.category}` : "Face-down tarot card"}
    >
      <defs>
        <linearGradient id="tc-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0A0A0A" />
          <stop offset="100%" stopColor="#0B1512" />
        </linearGradient>
        <radialGradient id="tc-sheen" cx="0.5" cy="0.42" r="0.55">
          <stop offset="0%" stopColor="#1F7A5A" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#0B3D2E" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tc-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E4C784" />
          <stop offset="50%" stopColor="#C9A961" />
          <stop offset="100%" stopColor="#8C7433" />
        </linearGradient>
        <radialGradient id="tc-back-sheen" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#1F7A5A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
        </radialGradient>
        <pattern id="tc-dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="#C9A961" fillOpacity="0.14" />
        </pattern>
      </defs>

      {/* Card body */}
      <rect x="0" y="0" width={CARD_W} height={CARD_H} rx="34" ry="34" fill="url(#tc-bg)" />
      <rect x="0" y="0" width={CARD_W} height={CARD_H} rx="34" ry="34" fill={faceUp ? "url(#tc-sheen)" : "url(#tc-back-sheen)"} />
      <rect x="0" y="0" width={CARD_W} height={CARD_H} rx="34" ry="34" fill="url(#tc-dots)" />

      {/* Ornate double gold frame */}
      <rect x="18" y="18" width={CARD_W - 36} height={CARD_H - 36} rx="24" ry="24"
        fill="none" stroke="url(#tc-gold)" strokeWidth="2.5" />
      <rect x="34" y="34" width={CARD_W - 68} height={CARD_H - 68} rx="18" ry="18"
        fill="none" stroke="#C9A961" strokeOpacity="0.45" strokeWidth="0.75" />

      {/* Corner filigree flourishes */}
      {[
        [46, 46, 1, 1],
        [CARD_W - 46, 46, -1, 1],
        [46, CARD_H - 46, 1, -1],
        [CARD_W - 46, CARD_H - 46, -1, -1],
      ].map(([cx, cy, sx, sy], i) => (
        <g key={i} transform={`translate(${cx} ${cy}) scale(${sx} ${sy})`} fill="none" stroke="#C9A961" strokeOpacity="0.7" strokeWidth="1.2">
          <path d="M0 26 Q0 0 26 0" />
          <path d="M6 26 Q6 6 26 6" strokeOpacity="0.35" />
          <circle cx="12" cy="12" r="1.6" fill="#C9A961" stroke="none" />
        </g>
      ))}

      {faceUp ? (
        <FaceUp feature={feature} roman={roman} Icon={Icon} />
      ) : (
        <FaceDown />
      )}
    </svg>
  );
});

function FaceUp({
  feature,
  roman,
  Icon,
}: {
  feature: Feature;
  roman: string;
  Icon: ReturnType<typeof iconForCategory>;
}) {
  // Wrap tagline into up to 3 lines by naive word wrap (SVG has no auto-wrap).
  const lines = wrapText(feature.tagline ?? "", 28, 3);
  const nameLines = wrapText(feature.name, 20, 2);

  return (
    <g>
      {/* Roman numeral index */}
      <text
        x={CARD_W / 2}
        y={112}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="26"
        fill="#C9A961"
        letterSpacing="6"
      >
        {roman}
      </text>
      <line x1={CARD_W / 2 - 44} y1={128} x2={CARD_W / 2 + 44} y2={128}
        stroke="#C9A961" strokeOpacity="0.4" strokeWidth="0.8" />

      {/* Category */}
      <text
        x={CARD_W / 2}
        y={158}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="15"
        fill="#FBF5E9"
        fillOpacity="0.55"
        letterSpacing="4"
      >
        {feature.category.toUpperCase()}
      </text>

      {/* Arcana glyph (category icon) with emerald aura */}
      <g transform={`translate(${CARD_W / 2 - 130} 220)`}>
        <circle cx="130" cy="130" r="150" fill="#1F7A5A" fillOpacity="0.14" />
        <circle cx="130" cy="130" r="120" fill="none" stroke="#C9A961" strokeOpacity="0.35" strokeWidth="1" />
        <circle cx="130" cy="130" r="106" fill="none" stroke="#C9A961" strokeOpacity="0.55" strokeWidth="0.6" strokeDasharray="2 4" />
        <g transform="translate(50 50)" color="#C9A961">
          <Icon size={160} strokeWidth={1.2} stroke="#C9A961" fill="none" />
        </g>
      </g>

      {/* Divider */}
      <line x1={90} y1={620} x2={CARD_W - 90} y2={620}
        stroke="#C9A961" strokeOpacity="0.35" strokeWidth="0.8" />
      <circle cx={CARD_W / 2} cy={620} r="3" fill="#C9A961" fillOpacity="0.7" />

      {/* Feature name */}
      {nameLines.map((l, i) => (
        <text
          key={i}
          x={CARD_W / 2}
          y={690 + i * 52}
          textAnchor="middle"
          fontFamily="'Geist', ui-sans-serif, system-ui, sans-serif"
          fontSize="42"
          fontWeight={600}
          fill="#FBF5E9"
          letterSpacing="1.5"
        >
          {l.toUpperCase()}
        </text>
      ))}

      {/* Tagline */}
      {lines.map((l, i) => (
        <text
          key={i}
          x={CARD_W / 2}
          y={820 + i * 34 + (nameLines.length - 1) * 20}
          textAnchor="middle"
          fontFamily="'Geist', ui-sans-serif, system-ui, sans-serif"
          fontSize="22"
          fill="#FBF5E9"
          fillOpacity="0.75"
        >
          {l}
        </text>
      ))}

      {/* Status pill */}
      <g transform={`translate(${CARD_W / 2 - 60} ${CARD_H - 150})`}>
        <rect x="0" y="0" width="120" height="34" rx="17" fill="none"
          stroke={feature.status === "GA" ? "#1F7A5A" : feature.status === "Beta" ? "#C9A961" : "#FBF5E9"}
          strokeOpacity="0.6" />
        <text x="60" y="22" textAnchor="middle"
          fontFamily="'JetBrains Mono', ui-monospace, monospace"
          fontSize="12" letterSpacing="3"
          fill={feature.status === "GA" ? "#1F7A5A" : feature.status === "Beta" ? "#C9A961" : "#FBF5E9"}
        >
          {feature.status.toUpperCase()}
        </text>
      </g>

      {/* Bottom mark */}
      <text
        x={CARD_W / 2}
        y={CARD_H - 62}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="11"
        fill="#FBF5E9"
        fillOpacity="0.35"
        letterSpacing="3"
      >
        THE LOVABLE FEATURE ATLAS
      </text>
    </g>
  );
}

function FaceDown() {
  // Ornate emerald + gold back pattern.
  return (
    <g>
      {/* Central medallion */}
      <g transform={`translate(${CARD_W / 2} ${CARD_H / 2})`}>
        <circle r="180" fill="none" stroke="#C9A961" strokeOpacity="0.55" strokeWidth="1" />
        <circle r="150" fill="none" stroke="#C9A961" strokeOpacity="0.4" strokeWidth="0.6" strokeDasharray="1 5" />
        <circle r="120" fill="none" stroke="#C9A961" strokeOpacity="0.55" strokeWidth="0.8" />
        <circle r="60" fill="#1F7A5A" fillOpacity="0.18" />
        {/* Heart mark, echoing the site heart */}
        <g transform="translate(-40 -40)">
          <path
            d="M40 68 L18 44 C13 39 13 29 18 24 C23 19 31 19 40 26 C49 19 57 19 62 24 C67 29 67 39 62 44 L40 68 Z"
            fill="url(#tc-gold)"
            stroke="#C9A961"
            strokeWidth="0.8"
          />
        </g>
        {/* radial rays */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const x1 = Math.cos(a) * 200;
          const y1 = Math.sin(a) * 200;
          const x2 = Math.cos(a) * 240;
          const y2 = Math.sin(a) * 240;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#C9A961" strokeOpacity="0.35" strokeWidth="1" />
          );
        })}
      </g>
      <text
        x={CARD_W / 2}
        y={CARD_H - 62}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="11"
        fill="#C9A961"
        fillOpacity="0.55"
        letterSpacing="6"
      >
        DRAW FROM THE ATLAS
      </text>
    </g>
  );
}

function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) {
      cur = w;
    } else if ((cur + " " + w).length <= maxChars) {
      cur += " " + w;
    } else {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (words.join(" ").length > lines.join(" ").length && lines.length === maxLines) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\s+\S+$/, "") + "…";
  }
  return lines;
}

/** Rasterize an SVG element to a PNG blob URL for download. */
export async function svgToPngUrl(svg: SVGSVGElement, scale = 2): Promise<string> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const source = new XMLSerializer().serializeToString(clone);
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
    canvas.width = CARD_W * scale;
    canvas.height = CARD_H * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
