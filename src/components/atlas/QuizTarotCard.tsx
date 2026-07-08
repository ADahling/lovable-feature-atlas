import { forwardRef } from "react";
import {
  CREAM,
  DeckBackMedallion,
  EMERALD,
  GOLD,
  HeartMark,
  TarotDefs,
  TarotFrame,
  toRoman,
  wrapText,
} from "../../lib/tarot-card";
import { TIERS } from "../../lib/tiers";

export type QuizCardOrientation = "portrait" | "landscape";

export const QUIZ_PORTRAIT = { w: 1080, h: 1350 };
export const QUIZ_LANDSCAPE = { w: 1200, h: 630 };

interface QuizTarotCardProps {
  count: number;
  total: number;
  tier: string;
  orientation: QuizCardOrientation;
  className?: string;
}

function tierIndex(name: string): number {
  const i = TIERS.findIndex((t) => t.name === name);
  return i >= 0 ? i : 0;
}

export const QuizTarotCard = forwardRef<SVGSVGElement, QuizTarotCardProps>(
  function QuizTarotCard({ count, total, tier, orientation, className = "" }, ref) {
    const dims = orientation === "portrait" ? QUIZ_PORTRAIT : QUIZ_LANDSCAPE;
    const roman = toRoman(tierIndex(tier));
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const tierUpper = tier.toUpperCase();
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        preserveAspectRatio="xMidYMid meet"
        className={className}
        role="img"
        aria-label={`Quiz result: ${count} of ${total}, tier ${tier}`}
      >
        <TarotDefs uid={`-q${orientation === "portrait" ? "p" : "l"}`} />
        <TarotFrame
          w={dims.w}
          h={dims.h}
          faceUp
          uid={`-q${orientation === "portrait" ? "p" : "l"}`}
          footer="THE LOVABLE FEATURE ATLAS · SELF-ASSESSMENT"
        >
          {orientation === "portrait" ? (
            <QuizPortrait
              w={dims.w}
              h={dims.h}
              tierUpper={tierUpper}
              roman={roman}
              count={count}
              total={total}
              pct={pct}
            />
          ) : (
            <QuizLandscape
              w={dims.w}
              h={dims.h}
              tierUpper={tierUpper}
              roman={roman}
              count={count}
              total={total}
              pct={pct}
            />
          )}
        </TarotFrame>
      </svg>
    );
  },
);

// ---------- Portrait 1080 x 1350 ----------

function QuizPortrait({
  w,
  h,
  tierUpper,
  roman,
  count,
  total,
  pct,
}: {
  w: number;
  h: number;
  tierUpper: string;
  roman: string;
  count: number;
  total: number;
  pct: number;
}) {
  const tierLines = wrapText(tierUpper, 16, 2);
  return (
    <g>
      {/* Roman numeral top */}
      <text
        x={w / 2}
        y={140}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="36"
        fill={GOLD}
        letterSpacing="10"
      >
        {roman}
      </text>
      <line
        x1={w / 2 - 60}
        y1={162}
        x2={w / 2 + 60}
        y2={162}
        stroke={GOLD}
        strokeOpacity="0.4"
        strokeWidth="0.9"
      />

      {/* Eyebrow */}
      <text
        x={w / 2}
        y={200}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="17"
        fill={CREAM}
        fillOpacity="0.55"
        letterSpacing="6"
      >
        SELF-ASSESSMENT
      </text>

      {/* Heart medallion as central arcana */}
      <g transform={`translate(${w / 2} 445)`}>
        <circle r="185" fill={EMERALD} fillOpacity="0.16" />
        <circle
          r="150"
          fill="none"
          stroke={GOLD}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <circle
          r="132"
          fill="none"
          stroke={GOLD}
          strokeOpacity="0.55"
          strokeWidth="0.6"
          strokeDasharray="2 4"
        />
        <g transform="translate(-80 -80)">
          <g transform="scale(1.6)">
            <HeartMark size={100} />
          </g>
        </g>
      </g>

      {/* Divider */}
      <line
        x1={140}
        y1={710}
        x2={w - 140}
        y2={710}
        stroke={GOLD}
        strokeOpacity="0.35"
        strokeWidth="0.8"
      />
      <circle cx={w / 2} cy={710} r="3" fill={GOLD} fillOpacity="0.7" />

      {/* Tier title */}
      {tierLines.map((l, i) => (
        <text
          key={i}
          x={w / 2}
          y={800 + i * 78}
          textAnchor="middle"
          fontFamily="'Geist', ui-sans-serif, system-ui, sans-serif"
          fontSize="70"
          fontWeight={600}
          fill={CREAM}
          letterSpacing="2"
        >
          {l}
        </text>
      ))}

      {/* Score */}
      <text
        x={w / 2}
        y={950 + (tierLines.length - 1) * 20}
        textAnchor="middle"
        fontFamily="'Geist', ui-sans-serif, system-ui, sans-serif"
        fontSize="34"
        fill={CREAM}
        fillOpacity="0.8"
      >
        {`I've used ${count} of ${total} Lovable features.`}
      </text>

      {/* Big percentage */}
      <text
        x={w / 2}
        y={1130}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="150"
        fill={EMERALD}
        letterSpacing="-2"
      >
        {`${pct}%`}
      </text>

      {/* CTA line */}
      <text
        x={w / 2}
        y={1210}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="15"
        fill={GOLD}
        fillOpacity="0.75"
        letterSpacing="4"
      >
        HOW MANY HAVE YOU USED?
      </text>
    </g>
  );
}

// ---------- Landscape 1200 x 630 (OG/social) ----------

function QuizLandscape({
  w,
  h,
  tierUpper,
  roman,
  count,
  total,
  pct,
}: {
  w: number;
  h: number;
  tierUpper: string;
  roman: string;
  count: number;
  total: number;
  pct: number;
}) {
  const tierLines = wrapText(tierUpper, 18, 2);
  return (
    <g>
      {/* Left column: heart medallion */}
      <g transform={`translate(210 ${h / 2 - 10})`}>
        <circle r="150" fill={EMERALD} fillOpacity="0.16" />
        <circle
          r="122"
          fill="none"
          stroke={GOLD}
          strokeOpacity="0.4"
          strokeWidth="1"
        />
        <circle
          r="106"
          fill="none"
          stroke={GOLD}
          strokeOpacity="0.55"
          strokeWidth="0.6"
          strokeDasharray="2 4"
        />
        <g transform="translate(-58 -58)">
          <g transform="scale(1.16)">
            <HeartMark size={100} />
          </g>
        </g>
      </g>

      {/* Roman + eyebrow */}
      <text
        x={430}
        y={130}
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="24"
        fill={GOLD}
        letterSpacing="8"
      >
        {roman}
      </text>
      <text
        x={430}
        y={162}
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="14"
        fill={CREAM}
        fillOpacity="0.55"
        letterSpacing="4"
      >
        SELF-ASSESSMENT
      </text>

      {/* Tier title */}
      {tierLines.map((l, i) => (
        <text
          key={i}
          x={430}
          y={230 + i * 60}
          fontFamily="'Geist', ui-sans-serif, system-ui, sans-serif"
          fontSize="54"
          fontWeight={600}
          fill={CREAM}
          letterSpacing="1.5"
        >
          {l}
        </text>
      ))}

      {/* Score */}
      <text
        x={430}
        y={340 + (tierLines.length - 1) * 20}
        fontFamily="'Geist', ui-sans-serif, system-ui, sans-serif"
        fontSize="26"
        fill={CREAM}
        fillOpacity="0.8"
      >
        {`I've used ${count} of ${total} Lovable features.`}
      </text>

      {/* Big percentage on right */}
      <text
        x={w - 100}
        y={h / 2 + 50}
        textAnchor="end"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="150"
        fill={EMERALD}
        letterSpacing="-2"
      >
        {`${pct}%`}
      </text>

      {/* Hint */}
      <text
        x={w - 100}
        y={h / 2 + 90}
        textAnchor="end"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="13"
        fill={GOLD}
        fillOpacity="0.75"
        letterSpacing="4"
      >
        HOW MANY HAVE YOU USED?
      </text>
    </g>
  );
}

// Face-down helper if ever needed (parity with feature deck).
export function QuizCardBack({
  orientation,
  className = "",
}: {
  orientation: QuizCardOrientation;
  className?: string;
}) {
  const dims = orientation === "portrait" ? QUIZ_PORTRAIT : QUIZ_LANDSCAPE;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${dims.w} ${dims.h}`}
      className={className}
      role="img"
      aria-label="Quiz card back"
    >
      <TarotDefs uid="-qb" />
      <TarotFrame w={dims.w} h={dims.h} faceUp={false} uid="-qb">
        <DeckBackMedallion cx={dims.w / 2} cy={dims.h / 2} />
      </TarotFrame>
    </svg>
  );
}
