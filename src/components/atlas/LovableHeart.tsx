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
          <stop offset="0%" stopColor="#FF2D87" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
      <path
        d="M32 54L11 33C5 27 5 18 11 12C17 6 26 6 32 12C38 6 47 6 53 12C59 18 59 27 53 33L32 54Z"
        fill="url(#lovable-heart-grad)"
        stroke="#831843"
        strokeOpacity={0.3}
        strokeWidth={0.5}
      />
    </svg>
  );
}
