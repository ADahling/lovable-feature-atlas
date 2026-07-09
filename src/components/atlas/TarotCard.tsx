import { forwardRef } from "react";
import type { Feature } from "../../data/features";
import {
  CREAM,
  CategoryArcana,
  DeckBackMedallion,
  EMERALD,
  FOREST,
  GOLD,
  TarotDefs,
  TarotFrame,
  fitTitle,
  toRoman,
  wrapText,
  svgToPngUrl as _svgToPngUrl,
} from "../../lib/tarot-card";


// Tarot proportions: 2:3.5. Use 700 x 1225 viewBox.
export const CARD_W = 700;
export const CARD_H = 1225;

// Re-export for existing callers (draw route).
export const svgToPngUrl = _svgToPngUrl;

interface TarotCardProps {
  feature: Feature;
  index: number; // 1-based index for roman numeral
  faceUp: boolean;
  className?: string;
}

export const TarotCard = forwardRef<SVGSVGElement, TarotCardProps>(function TarotCard(
  { feature, index, faceUp, className = "" },
  ref,
) {
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
      <TarotDefs />
      <TarotFrame
        w={CARD_W}
        h={CARD_H}
        faceUp={faceUp}
        footer={faceUp ? "THE LOVABLE FEATURE ATLAS" : "DRAW FROM THE ATLAS"}
      >
        {faceUp ? <FaceUp feature={feature} roman={roman} /> : <FaceDown />}
      </TarotFrame>
    </svg>
  );
});

function FaceUp({ feature, roman }: { feature: Feature; roman: string }) {
  const nameLines = wrapText(feature.name, 22, 3);
  const nameFontSize = nameLines.length >= 3 ? 32 : nameLines.length === 2 ? 40 : 46;
  const nameLineHeight = nameLines.length >= 3 ? 40 : 52;
  const taglineLines = wrapText(feature.tagline ?? "", 28, 3);

  return (
    <g>
      {/* Roman numeral */}
      <text
        x={CARD_W / 2}
        y={112}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="26"
        fill={GOLD}
        letterSpacing="6"
      >
        {roman}
      </text>
      <line
        x1={CARD_W / 2 - 44}
        y1={128}
        x2={CARD_W / 2 + 44}
        y2={128}
        stroke={GOLD}
        strokeOpacity="0.4"
        strokeWidth="0.8"
      />

      {/* Category */}
      <text
        x={CARD_W / 2}
        y={158}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="15"
        fill={CREAM}
        fillOpacity="0.55"
        letterSpacing="4"
      >
        {feature.category.toUpperCase()}
      </text>

      {/* Arcana glyph */}
      <CategoryArcana category={feature.category} cx={CARD_W / 2} cy={355} radius={130} />

      {/* Divider */}
      <line
        x1={90}
        y1={620}
        x2={CARD_W - 90}
        y2={620}
        stroke={GOLD}
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
      <circle cx={CARD_W / 2} cy={620} r="3" fill={GOLD} fillOpacity="0.7" />

      {/* Name — up to 3 lines, font auto-scales so long titles like
          "SAML 2.0 Single Sign-On" don't ellipsize. */}
      {nameLines.map((l, i) => (
        <text
          key={i}
          x={CARD_W / 2}
          y={690 + i * nameLineHeight}
          textAnchor="middle"
          fontFamily="'Geist', ui-sans-serif, system-ui, sans-serif"
          fontSize={nameFontSize}
          fontWeight={600}
          fill={CREAM}
          letterSpacing="1.5"
        >
          {l.toUpperCase()}
        </text>
      ))}

      {/* Tagline */}
      {taglineLines.map((l, i) => (
        <text
          key={i}
          x={CARD_W / 2}
          y={820 + i * 34 + (nameLines.length - 1) * 20}
          textAnchor="middle"
          fontFamily="'Geist', ui-sans-serif, system-ui, sans-serif"
          fontSize="22"
          fill={CREAM}
          fillOpacity="0.75"
        >
          {l}
        </text>
      ))}

      {/* Status pill */}
      <g transform={`translate(${CARD_W / 2 - 60} ${CARD_H - 150})`}>
        <rect
          x="0"
          y="0"
          width="120"
          height="34"
          rx="17"
          fill="none"
          stroke={
            feature.status === "GA"
              ? EMERALD
              : feature.status === "Beta"
                ? GOLD
                : CREAM
          }
          strokeOpacity="0.6"
        />
        <text
          x="60"
          y="22"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', ui-monospace, monospace"
          fontSize="12"
          letterSpacing="3"
          fill={
            feature.status === "GA"
              ? EMERALD
              : feature.status === "Beta"
                ? GOLD
                : CREAM
          }
        >
          {feature.status.toUpperCase()}
        </text>
      </g>
    </g>
  );
}

function FaceDown() {
  return <DeckBackMedallion cx={CARD_W / 2} cy={CARD_H / 2} />;
}

// Keep FOREST referenced (used by TarotFrame's radialGradient stop but
// re-export it for parity with the shared module).
void FOREST;
