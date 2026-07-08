import { useEffect, useRef } from "react";

export interface QuizCardProps {
  count: number;
  total: number;
  tier: string;
  onReady?: (canvas: HTMLCanvasElement) => void;
}

// Brand palette (kept literal so the canvas renders identically without
// touching CSS custom properties, which aren't available in <canvas>).
const INK = "#0A0A0A";
const FOREST = "#0B3D2E";
const EMERALD = "#1F7A5A";
const GOLD = "#C9A961";
const CREAM = "#FBF5E9";

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  // Simple SVG-mimic heart with the site's emerald→gold gradient.
  const grad = ctx.createLinearGradient(cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2);
  grad.addColorStop(0, EMERALD);
  grad.addColorStop(1, GOLD);
  ctx.fillStyle = grad;
  ctx.beginPath();
  const s = size / 64;
  const x = cx - 32 * s;
  const y = cy - 32 * s;
  ctx.moveTo(x + 32 * s, y + 50 * s);
  ctx.lineTo(x + 14 * s, y + 32 * s);
  ctx.bezierCurveTo(x + 9 * s, y + 27 * s, x + 9 * s, y + 19 * s, x + 14 * s, y + 14 * s);
  ctx.bezierCurveTo(x + 19 * s, y + 9 * s, x + 27 * s, y + 9 * s, x + 32 * s, y + 14 * s);
  ctx.bezierCurveTo(x + 37 * s, y + 9 * s, x + 45 * s, y + 9 * s, x + 50 * s, y + 14 * s);
  ctx.bezierCurveTo(x + 55 * s, y + 19 * s, x + 55 * s, y + 27 * s, x + 50 * s, y + 32 * s);
  ctx.closePath();
  ctx.fill();
}

export function QuizResultCard({ count, total, tier, onReady }: QuizCardProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Deep ink base
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, W, H);

    // 2. Subtle emerald radial glow, off-center-left
    const glow = ctx.createRadialGradient(360, 340, 40, 360, 340, 640);
    glow.addColorStop(0, "rgba(31,122,90,0.32)");
    glow.addColorStop(0.55, "rgba(11,61,46,0.14)");
    glow.addColorStop(1, "rgba(10,10,10,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // 3. Thin gold hairline frame (editorial restraint)
    ctx.strokeStyle = "rgba(201,169,97,0.28)";
    ctx.lineWidth = 1;
    ctx.strokeRect(40.5, 40.5, W - 81, H - 81);

    // 4. Header lockup: heart + eyebrow
    drawHeart(ctx, 96, 100, 44);
    ctx.fillStyle = "rgba(251,245,233,0.9)";
    ctx.font = '500 18px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = "middle";
    ctx.fillText("THE  LOVABLE  FEATURE  ATLAS", 140, 100);

    // 5. Tier name (gold, Geist bold)
    ctx.fillStyle = GOLD;
    ctx.font = '600 34px "Geist", ui-sans-serif, system-ui, sans-serif';
    ctx.textBaseline = "alphabetic";
    ctx.fillText(tier.toUpperCase(), 80, 250);
    // gold underline mark
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 268);
    ctx.lineTo(80 + Math.min(ctx.measureText(tier.toUpperCase()).width, 620), 268);
    ctx.stroke();

    // 6. Headline: "I've used N of TOTAL"
    ctx.fillStyle = CREAM;
    ctx.font = '700 78px "Geist", ui-sans-serif, system-ui, sans-serif';
    const line1 = `I've used ${count} of ${total}`;
    ctx.fillText(line1, 80, 360);
    ctx.font = '600 58px "Geist", ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = "rgba(251,245,233,0.85)";
    ctx.fillText("Lovable features.", 80, 430);

    // 7. Big mono percentage on the right
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    ctx.font = '500 140px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = EMERALD;
    ctx.textAlign = "right";
    ctx.fillText(`${pct}%`, W - 80, 400);
    ctx.textAlign = "left";

    // 8. Footer hairline + attribution
    ctx.strokeStyle = "rgba(251,245,233,0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, H - 110);
    ctx.lineTo(W - 80, H - 110);
    ctx.stroke();

    ctx.fillStyle = "rgba(251,245,233,0.65)";
    ctx.font = '500 18px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText("lovable-feature-atlas.lovable.app  ·  independent fan project", 80, H - 70);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(201,169,97,0.75)";
    ctx.fillText("How many have you used?", W - 80, H - 70);
    ctx.textAlign = "left";

    // Signal parent (fonts may still be loading — draw once more after fonts settle).
    if (onReady) onReady(canvas);
    if (typeof document !== "undefined" && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => {
        // Redraw text-only layers with loaded fonts for crisper glyphs.
        if (!ref.current) return;
        onReady?.(canvas);
      });
    }
    // suppress unused var
    void FOREST;
  }, [count, total, tier, onReady]);

  return (
    <canvas
      ref={ref}
      className="h-auto w-full max-w-full rounded-lg border border-cream/12 bg-ink shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
      role="img"
      aria-label={`I've used ${count} of ${total} Lovable features. Tier: ${tier}.`}
    />
  );
}
