/**
 * Light-mode signature hero object — a warm, saturated gold-foil heart
 * with a radiating sunburst engraved on cream paper. The larger hero gets the
 * 3D globe; this is the light-mode signature so toggling reveals a
 * second world, not a dimmer switch.
 */
import { HEART_PATH_D } from "../../lib/heart-path";

interface LightHeroHeartProps {
  className?: string;
}

export function LightHeroHeart({ className }: LightHeroHeartProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Embossed atlas heart"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Warm amber glow ring — richer and closer so the heart sits in a
            pool of warm light, not a wash. */}
        <radialGradient id="lh-glow" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0%" stopColor="#E9BE6A" stopOpacity="0.75" />
          <stop offset="35%" stopColor="#C9A961" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
        </radialGradient>

        {/* Gold-foil surface — deeper, more saturated amber with a hot
            highlight on the upper-left lobe and a burnt shadow at the base.
            This is the single biggest lift toward the mockup: no more pale
            cream, real gold-leaf saturation. */}
        <linearGradient id="lh-foil" x1="0.2" y1="0.05" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="18%" stopColor="#F1CE7A" />
          <stop offset="42%" stopColor="#D4A94A" />
          <stop offset="68%" stopColor="#A87F2E" />
          <stop offset="100%" stopColor="#5E441A" />
        </linearGradient>

        {/* Diagonal specular streak */}
        <linearGradient id="lh-spec" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="38%" stopColor="#FFF6D8" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Foil crinkle — subtle turbulence tinted amber, multiplied over
            the foil so the surface reads as beaten gold leaf, not enamel. */}
        <filter id="lh-crinkle" x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" />
          <feColorMatrix
            values="0 0 0 0 0.78
                    0 0 0 0 0.55
                    0 0 0 0 0.18
                    0 0 0 0.55 0"
          />
        </filter>

        {/* Letterpress emboss */}
        <filter id="lh-emboss" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="5"
            specularConstant="1.35"
            specularExponent="24"
            lightingColor="#FFF3C8"
            result="spec"
          >
            <feDistantLight azimuth="315" elevation="55" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="specClip" />
          </feMerge>
        </filter>

        {/* Drop shadow */}
        <filter id="lh-drop" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" />
          <feOffset dx="0" dy="16" result="off" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.32" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip the crinkle texture to the heart silhouette */}
        <clipPath id="lh-heart-clip" clipPathUnits="userSpaceOnUse">
          <g transform="translate(300 300) scale(4.2) translate(-32 -32)">
            <path d={HEART_PATH_D} />
          </g>
        </clipPath>
      </defs>

      {/* Warm amber glow */}
      <circle cx="300" cy="300" r="280" fill="url(#lh-glow)" />

      {/* Radiating sunburst — the dominant background element in the mockup.
          Rays emanate FROM behind the heart outward, dense and warm, with a
          mix of long and short strokes for a classic engraved starburst. */}
      <g stroke="#B8892E" opacity="0.62">
        {Array.from({ length: 96 }).map((_, i) => {
          const a = (i / 96) * Math.PI * 2 - Math.PI / 2;
          const kind = i % 4;
          const r0 = 148;
          const r1 = kind === 0 ? 278 : kind === 1 ? 232 : kind === 2 ? 258 : 208;
          const w = kind === 0 ? 1.1 : kind === 2 ? 0.7 : 0.45;
          const o = kind === 0 ? 0.75 : kind === 2 ? 0.55 : 0.32;
          return (
            <line
              key={i}
              x1={300 + Math.cos(a) * r0}
              y1={300 + Math.sin(a) * r0}
              x2={300 + Math.cos(a) * r1}
              y2={300 + Math.sin(a) * r1}
              strokeWidth={w}
              strokeOpacity={o}
              strokeLinecap="round"
            />
          );
        })}
      </g>

      {/* One quiet outer meridian — keeps the astrolabe reference without
          fighting the sunburst. */}
      <circle
        cx="300"
        cy="300"
        r="272"
        fill="none"
        stroke="#8C7433"
        strokeWidth="0.5"
        strokeOpacity="0.28"
        strokeDasharray="2 6"
      />

      {/* Debossed impression well behind the foil */}
      <g transform="translate(300 300)">
        <g transform="scale(4.4) translate(-32 -32)" opacity="0.5">
          <path d={HEART_PATH_D} fill="#7A5A22" opacity="0.28" transform="translate(0.6 4)" />
        </g>

        {/* Gold-foil heart body */}
        <g transform="scale(4.4) translate(-32 -32)" filter="url(#lh-drop)">
          <g filter="url(#lh-emboss)">
            <path
              d={HEART_PATH_D}
              fill="url(#lh-foil)"
              stroke="#6B5222"
              strokeOpacity="0.55"
              strokeWidth="0.4"
            />
            {/* Specular streak */}
            <path d={HEART_PATH_D} fill="url(#lh-spec)" opacity="0.85" />
          </g>
        </g>

        {/* Foil crinkle texture clipped to the heart silhouette — the
            beaten-leaf micro-detail that makes the surface read as gold
            leaf rather than flat enamel. */}
        <g clipPath="url(#lh-heart-clip)" style={{ mixBlendMode: "overlay" }} opacity="0.55">
          <rect x="0" y="0" width="600" height="600" filter="url(#lh-crinkle)" />
        </g>

        {/* Inner filigree — thin engraved inset line */}
        <g transform="scale(4.4) translate(-32 -32)">
          <path
            d={HEART_PATH_D}
            fill="none"
            stroke="#6B5222"
            strokeOpacity="0.4"
            strokeWidth="0.35"
            transform="translate(32 32) scale(0.82) translate(-32 -32)"
          />
        </g>
      </g>
    </svg>
  );
}
