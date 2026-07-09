import { HEART_PATH_D, HEART_VIEW_BOX } from "../../lib/heart-path";

interface LovableHeartProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Atlas mark — emerald-to-gold heart used as the catalog's wordmark.
 * Silhouette is the canonical Atlas heart (see src/lib/heart-path.ts).
 */
export function LovableHeart({ className, ...rest }: LovableHeartProps) {
  const hidden = rest["aria-hidden"] === true || rest["aria-hidden"] === "true";
  return (
    <svg
      viewBox={HEART_VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
      {...(hidden ? { "aria-hidden": true, focusable: false } : { role: "img", "aria-label": "Atlas mark" })}
      className={className}
    >
      <defs>
        <linearGradient id="atlas-heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1F7A5A" />
          <stop offset="55%" stopColor="#2EA579" />
          <stop offset="100%" stopColor="#C9A961" />
        </linearGradient>
      </defs>
      <path d={HEART_PATH_D} fill="url(#atlas-heart-grad)" />
    </svg>
  );
}
