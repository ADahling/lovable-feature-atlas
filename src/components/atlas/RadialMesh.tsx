/**
 * Warm paper-grain and amber radial glow for the light Atlas canvas.
 */
export function RadialMesh() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(55% 45% at 78% 22%, color-mix(in oklab, #E8B96B 45%, transparent) 0%, transparent 72%)",
            "radial-gradient(48% 40% at 18% 78%, color-mix(in oklab, #8E7434 22%, transparent) 0%, transparent 70%)",
            "radial-gradient(90% 70% at 50% 55%, transparent 40%, color-mix(in oklab, #C7B58A 22%, transparent) 100%)",
          ].join(","),
          opacity: 0.9,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.35,
          mixBlendMode: "multiply",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.42  0 0 0 0 0.34  0 0 0 0 0.22  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "320px 320px",
        }}
      />
    </div>
  );
}
