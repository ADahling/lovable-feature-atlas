import { useEffect, useRef } from "react";

export interface QuizCardProps {
  count: number;
  total: number;
  tier: string;
  onReady?: (canvas: HTMLCanvasElement) => void;
}

// Brand palette (kept literal for canvas — no CSS custom properties).
const INK = "#0A0A0A";
const FOREST = "#0B3D2E";
const EMERALD = "#1F7A5A";
const GOLD = "#C9A961";
const CREAM = "#FBF5E9";

function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 64;
  const x = cx - 32 * s;
  const y = cy - 32 * s;
  ctx.beginPath();
  ctx.moveTo(x + 32 * s, y + 54 * s);
  ctx.lineTo(x + 14 * s, y + 32 * s);
  ctx.bezierCurveTo(x + 9 * s, y + 27 * s, x + 9 * s, y + 19 * s, x + 14 * s, y + 14 * s);
  ctx.bezierCurveTo(x + 19 * s, y + 9 * s, x + 27 * s, y + 9 * s, x + 32 * s, y + 14 * s);
  ctx.bezierCurveTo(x + 37 * s, y + 9 * s, x + 45 * s, y + 9 * s, x + 50 * s, y + 14 * s);
  ctx.bezierCurveTo(x + 55 * s, y + 19 * s, x + 55 * s, y + 27 * s, x + 50 * s, y + 32 * s);
  ctx.closePath();
}

function drawFilledHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fill: string | CanvasGradient,
) {
  heartPath(ctx, cx, cy, size);
  ctx.fillStyle = fill;
  ctx.fill();
}

// Tiny seeded PRNG for reproducible grain
function drawGrain(ctx: CanvasRenderingContext2D, W: number, H: number, density: number) {
  const count = Math.floor(W * H * density);
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = CREAM;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function drawCard(
  canvas: HTMLCanvasElement,
  count: number,
  total: number,
  tier: string,
  displayPct: number,
) {
  const W = 1200;
  const H = 630;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Deep ink base
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  // 2. Emerald radial glow, off-center-left
  const glow = ctx.createRadialGradient(360, 340, 40, 360, 340, 680);
  glow.addColorStop(0, "rgba(31,122,90,0.34)");
  glow.addColorStop(0.55, "rgba(11,61,46,0.14)");
  glow.addColorStop(1, "rgba(10,10,10,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 3. Background heart art (low opacity, extends off right edge)
  ctx.save();
  ctx.globalAlpha = 0.09;
  const bgGrad = ctx.createLinearGradient(W - 200, 100, W + 100, H);
  bgGrad.addColorStop(0, GOLD);
  bgGrad.addColorStop(1, EMERALD);
  drawFilledHeart(ctx, W - 60, H / 2 + 40, 620, bgGrad);
  ctx.restore();

  // 4. Grain overlay
  drawGrain(ctx, W, H, 0.0007);

  // 5. Gold hairline frame
  ctx.strokeStyle = "rgba(201,169,97,0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(40.5, 40.5, W - 81, H - 81);

  // 6. Header lockup: heart mark + eyebrow
  const hGrad = ctx.createLinearGradient(74, 78, 118, 122);
  hGrad.addColorStop(0, EMERALD);
  hGrad.addColorStop(1, GOLD);
  drawFilledHeart(ctx, 96, 100, 44, hGrad);
  ctx.fillStyle = "rgba(251,245,233,0.9)";
  ctx.font = '500 18px "JetBrains Mono", ui-monospace, monospace';
  ctx.textBaseline = "middle";
  ctx.fillText("THE  LOVABLE  FEATURE  ATLAS", 140, 100);

  // 7. Tier name (gold, Geist bold)
  ctx.fillStyle = GOLD;
  ctx.font = '600 34px "Geist", ui-sans-serif, system-ui, sans-serif';
  ctx.textBaseline = "alphabetic";
  ctx.fillText(tier.toUpperCase(), 80, 250);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 268);
  ctx.lineTo(80 + Math.min(ctx.measureText(tier.toUpperCase()).width, 620), 268);
  ctx.stroke();

  // 8. Headline
  ctx.fillStyle = CREAM;
  ctx.font = '700 78px "Geist", ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(`I've used ${count} of ${total}`, 80, 360);
  ctx.font = '600 58px "Geist", ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = "rgba(251,245,233,0.85)";
  ctx.fillText("Lovable features.", 80, 430);

  // 9. Big mono percentage on the right (animated value)
  ctx.font = '500 140px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = EMERALD;
  ctx.textAlign = "right";
  ctx.fillText(`${displayPct}%`, W - 80, 400);
  ctx.textAlign = "left";

  // 10. Footer hairline + attribution
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

  void FOREST;
}

export function QuizResultCard({ count, total, tier, onReady }: QuizCardProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const targetPct = total > 0 ? Math.round((count / total) * 100) : 0;
    const DURATION = 900; // ms
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(targetPct * eased);
      drawCard(canvas, count, total, tier, current);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onReady?.(canvas);
        // Redraw once fonts are ready for crisp final glyphs
        if (typeof document !== "undefined" && (document as any).fonts?.ready) {
          (document as any).fonts.ready.then(() => {
            if (!ref.current) return;
            drawCard(ref.current, count, total, tier, targetPct);
            onReady?.(ref.current);
          });
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
