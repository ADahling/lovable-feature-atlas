import { useId } from "react";
import { HEART_PATH_D, HEART_VIEW_BOX } from "../../lib/heart-path";

interface LovableHeartProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Atlas mark — heart used as the catalog's wordmark.
 * Antique-gold foil mark for the Atlas light-paper visual system.
 * Silhouette is the canonical Atlas heart (see src/lib/heart-path.ts).
 */
export function LovableHeart({ className, ...rest }: LovableHeartProps) {
  const hidden = rest["aria-hidden"] === true || rest["aria-hidden"] === "true";
  const uid = useId().replace(/:/g, "");
  const gradId = `atlas-heart-grad-${uid}`;

  return (
    <svg
      viewBox={HEART_VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
      {...(hidden ? { "aria-hidden": true, focusable: false } : { role: "img", "aria-label": "Atlas mark" })}
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D8BC77" />
          <stop offset="55%" stopColor="#C9A961" />
          <stop offset="100%" stopColor="#8A6B2E" />
        </linearGradient>
      </defs>
      <path d={HEART_PATH_D} fill={`url(#${gradId})`} />
    </svg>
  );
}
