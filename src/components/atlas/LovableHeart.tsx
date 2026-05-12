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
        d="M32 56C32 56 8 40 8 24C8 16 14 10 22 10C26.5 10 30 12 32 16C34 12 37.5 10 42 10C50 10 56 16 56 24C56 40 32 56 32 56Z"
        fill="url(#lovable-heart-grad)"
        stroke="#831843"
        strokeOpacity={0.4}
        strokeWidth={1}
      />
    </svg>
  );
}
