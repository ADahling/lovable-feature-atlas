interface LovableHeartProps {
  className?: string;
}

export function LovableHeart({ className }: LovableHeartProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lovable"
      className={className}
    >
      <defs>
        <linearGradient id="lovable-heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5C9A" />
          <stop offset="55%" stopColor="#E94BCB" />
          <stop offset="100%" stopColor="#9B5DE5" />
        </linearGradient>
      </defs>
      <path
        d="M32 54L11 33C5 27 5 18 11 12C17 6 26 6 32 12C38 6 47 6 53 12C59 18 59 27 53 33L32 54Z"
        fill="url(#lovable-heart-grad)"
      />
    </svg>
  );
}
