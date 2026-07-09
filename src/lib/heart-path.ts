/**
 * Canonical Atlas heart silhouette. Source of truth: the 3D hero heart
 * (Globe.tsx) — the most-seen heart on the site. Every 2D heart across
 * the codebase (wordmark, embossed light-mode hero, tarot HeartMark,
 * favicon, OG marks, email templates) MUST regenerate from this path so
 * the silhouette is identical everywhere; only the material differs
 * per context (enamel in 3D, flat emerald in the wordmark, gold foil
 * on cream, engraved gold on cards).
 *
 * Coordinates are authored on a 64x64 grid. Consumers scale via SVG
 * `viewBox` or a wrapping transform.
 */

// SVG path — canonical silhouette, 64x64 grid.
export const HEART_PATH_D =
  "M32 58C20 48 2 38 2 22C2 8 20 2 32 18C44 2 62 8 62 22C62 38 44 48 32 58Z";

export const HEART_VIEW_BOX = "0 0 64 64";
export const HEART_GRID = 64;

// Control points in the canonical 64x64 space, used by both the 2D
// path above and the 3D THREE.Shape builder below. Kept as a single
// list so any future silhouette tweak lands in exactly one place.
const HEART_CONTROL_POINTS = {
  start: [32, 58] as const,
  curves: [
    [[20, 48], [2, 38], [2, 22]],
    [[2, 8], [20, 2], [32, 18]],
    [[44, 2], [62, 8], [62, 22]],
    [[62, 38], [44, 48], [32, 58]],
  ] as const,
};

/**
 * Build the canonical heart as a THREE.Shape. Kept in this module so
 * the 3D geometry and every 2D rendering share literally the same
 * control points.
 */
export function buildHeartShape(
  THREE: typeof import("three"),
  scale = 0.032,
): import("three").Shape {
  const toX = (x: number) => (x - 32) * scale;
  const toY = (y: number) => -(y - 32) * scale;
  const shape = new THREE.Shape();
  const [sx, sy] = HEART_CONTROL_POINTS.start;
  shape.moveTo(toX(sx), toY(sy));
  for (const [[c1x, c1y], [c2x, c2y], [ex, ey]] of HEART_CONTROL_POINTS.curves) {
    shape.bezierCurveTo(toX(c1x), toY(c1y), toX(c2x), toY(c2y), toX(ex), toY(ey));
  }
  return shape;
}
