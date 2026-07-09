interface LovableHeartProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Atlas mark — emerald-to-gold heart used as the catalog's wordmark.
 * Intentionally NOT Lovable's pink/violet brand — this is a fan project.
 */
export function LovableHeart({ className, ...rest }: LovableHeartProps) {
  const hidden = rest["aria-hidden"] === true || rest["aria-hidden"] === "true";
  return (
    <svg
      viewBox="0 0 64 64"
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
      <path
        d="M32 58C20 48 2 38 2 22C2 8 20 2 32 18C44 2 62 8 62 22C62 38 44 48 32 58Z"
        fill="url(#atlas-heart-grad)"
      />
    </svg>
  );
}
