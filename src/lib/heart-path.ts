/**
 * Canonical Atlas heart silhouette. Every heart across the codebase
 * (wordmark, embossed hero, tarot HeartMark, favicon, OG marks, and email
 * templates) uses this path so the silhouette stays identical.
 *
 * Coordinates are authored on a 64x64 grid. Consumers scale via SVG
 * `viewBox` or a wrapping transform.
 */

// SVG path — canonical silhouette, 64x64 grid.
export const HEART_PATH_D =
  "M32 58C20 48 2 38 2 22C2 8 20 2 32 18C44 2 62 8 62 22C62 38 44 48 32 58Z";

export const HEART_VIEW_BOX = "0 0 64 64";
