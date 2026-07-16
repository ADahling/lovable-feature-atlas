/**
 * Light-mode signature hero object — an embossed gold-foil heart on
 * warm cream paper. Dark mode gets the 3D globe; this gives light mode
 * its own signature so toggling reveals a second world, not a dimmer
 * switch.
 *
 * Rendered as SVG (paper grain via inline turbulence, gold foil via
 * layered gradients, letterpress via inner-shadow filters). No 3D bundle
 * required — instant paint on light mode.
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
        {/* Warm amber glow ring */}
        <radialGradient id="lh-glow" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#C9A961" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#C9A961" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
        </radialGradient>

        {/* Gold-foil surface gradient (highlight → mid → shadow) */}
        <linearGradient id="lh-foil" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#F5E4B5" />
          <stop offset="30%" stopColor="#E4C784" />
          <stop offset="55%" stopColor="#C9A961" />
          <stop offset="80%" stopColor="#8C7433" />
          <stop offset="100%" stopColor="#6B5726" />
        </linearGradient>

        {/* Diagonal specular streak overlay */}
        <linearGradient id="lh-spec" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="42%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="52%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Paper grain — subtle turbulence over warm cream */}
        <filter id="lh-paper" x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix
            values="0 0 0 0 0.82
                    0 0 0 0 0.76
                    0 0 0 0 0.62
                    0 0 0 0.08 0"
          />
        </filter>

        {/* Letterpress emboss — inner highlight + inner shadow */}
        <filter id="lh-emboss" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="4"
            specularConstant="1.1"
            specularExponent="22"
            lightingColor="#FFF6DF"
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

        {/* Drop shadow cast on the paper */}
        <filter id="lh-drop" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" />
          <feOffset dx="0" dy="14" result="off" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.28" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Warm amber glow behind */}
      <circle cx="300" cy="300" r="260" fill="url(#lh-glow)" />

      {/* Paper texture layer inside a soft rounded panel */}
      <g opacity="0.55">
        <rect x="60" y="60" width="480" height="480" rx="24" fill="#F3E9D3" />
        <rect
          x="60"
          y="60"
          width="480"
          height="480"
          rx="24"
          filter="url(#lh-paper)"
          opacity="0.7"
        />
      </g>

      {/* Engraved ray burst — fine radiating hairlines, alternating long and
          short like a classic cartographic sunburst. Sits on the paper, under
          the foil heart, so the plate reads as an engraved star-chart body. */}
      <g stroke="#8C7433" opacity="0.5">
        {Array.from({ length: 48 }).map((_, i) => {
          const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
          const long = i % 4 === 0;
          const r0 = 168;
          const r1 = long ? 244 : i % 2 === 0 ? 214 : 196;
          return (
            <line
              key={i}
              x1={300 + Math.cos(a) * r0}
              y1={300 + Math.sin(a) * r0}
              x2={300 + Math.cos(a) * r1}
              y2={300 + Math.sin(a) * r1}
              strokeWidth={long ? 0.9 : 0.55}
              strokeOpacity={long ? 0.5 : 0.3}
            />
          );
        })}
      </g>

      {/* Debossed impression well — soft cream shadow inside the heart shape */}
      <g transform="translate(300 300)">
        <g transform="scale(4.2) translate(-32 -32)" opacity="0.35">
          <path
            d={HEART_PATH_D}
            fill="#C9A961"
            opacity="0.18"
            transform="translate(0 3)"
          />
        </g>

        {/* Gold-foil heart body with emboss lighting */}
        <g transform="scale(4.2) translate(-32 -32)" filter="url(#lh-drop)">
          <g filter="url(#lh-emboss)">
            <path
              d={HEART_PATH_D}
              fill="url(#lh-foil)"
              stroke="#8C7433"
              strokeOpacity="0.4"
              strokeWidth="0.35"
            />
            {/* Foil specular streak */}
            <path
              d={HEART_PATH_D}
              fill="url(#lh-spec)"
              opacity="0.75"
            />
          </g>
        </g>

        {/* Inner filigree — thin engraved line inset from the canonical curve */}
        <g transform="scale(4.2) translate(-32 -32)">
          <path
            d={HEART_PATH_D}
            fill="none"
            stroke="#8C7433"
            strokeOpacity="0.35"
            strokeWidth="0.35"
            transform="translate(32 32) scale(0.82) translate(-32 -32)"
          />
        </g>
      </g>


      {/* Corner filigree marks — anchors it as a printed plate, not a floating shape */}
      {[
        [78, 78, 1, 1],
        [522, 78, -1, 1],
        [78, 522, 1, -1],
        [522, 522, -1, -1],
      ].map(([cx, cy, sx, sy], i) => (
        <g
          key={i}
          transform={`translate(${cx} ${cy}) scale(${sx} ${sy})`}
          fill="none"
          stroke="#8C7433"
          strokeOpacity="0.35"
          strokeWidth="0.9"
        >
          <path d="M0 22 Q0 0 22 0" />
          <path d="M6 22 Q6 6 22 6" strokeOpacity="0.2" />
          <circle cx="11" cy="11" r="1.1" fill="#8C7433" fillOpacity="0.55" stroke="none" />
        </g>
      ))}
    </svg>
  );
}
