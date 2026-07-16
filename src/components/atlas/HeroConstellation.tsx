import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion, useScroll, useSpring, useTransform, motion } from "framer-motion";
import { useFeatures } from "../../hooks/use-features";
import { accentForCategory } from "../../lib/category-theme";
import { useTheme } from "../../hooks/use-theme";
import type { FeatureCard } from "../../lib/features.functions";

// Deterministic PRNG so the constellation is stable across renders and SSR.
function hashId(id: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VBW = 1000;
const VBH = 720;

// Bayer-style designations for the 18 category anchors.
const GREEK_LETTERS = [
  "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι",
  "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ρ", "σ",
] as const;

interface Node {
  id: string;
  slug: string;
  name: string;
  category: string;
  cx: number;
  cy: number;
  isNewest: boolean;
  color: string;
  ageDays: number;
}

interface Anchor {
  category: string;
  cx: number;
  cy: number;
}

interface CatEdge {
  a: Node;
  b: Node;
  phase: number;
  color: string;
  category: string;
}

function buildGraph(
  features: FeatureCard[],
  theme: "dark" | "light",
): {
  nodes: Node[];
  anchors: Anchor[];
  edges: [Anchor, Anchor][];
  catEdges: CatEdge[];
  newestId: string | null;
  featuredPath: { category: string; nodes: Node[] } | null;
} {
  const cats = Array.from(new Set(features.map((f) => f.category))).sort();
  const anchors: Anchor[] = cats.map((c, i) => {
    const total = cats.length;
    const t = (i + 0.5) / total;
    const angle = t * Math.PI * 2 * 1.618;
    const rx = 340 + ((i * 53) % 90);
    const ry = 210 + ((i * 37) % 60);
    return {
      category: c,
      cx: VBW / 2 + Math.cos(angle) * rx,
      cy: VBH / 2 + Math.sin(angle) * ry,
    };
  });
  const anchorMap = new Map<string, Anchor>(anchors.map((a) => [a.category, a]));

  let newestId: string | null = null;
  let newestTs = 0;
  for (const f of features) {
    if (!f.releaseDate) continue;
    const ts = new Date(f.releaseDate).getTime();
    if (Number.isFinite(ts) && ts > newestTs) {
      newestTs = ts;
      newestId = f.id;
    }
  }

  const now = Date.now();
  const nodes: Node[] = features.map((f) => {
    const anchor = anchorMap.get(f.category)!;
    const rand = mulberry32(hashId(f.id));
    const r = Math.sqrt(rand()) * 92;
    const theta = rand() * Math.PI * 2;
    const releaseTs = f.releaseDate ? new Date(f.releaseDate).getTime() : 0;
    const ageDays = releaseTs ? (now - releaseTs) / 86400000 : 9999;
    return {
      id: f.id,
      slug: f.id,
      name: f.name,
      category: f.category,
      cx: anchor.cx + Math.cos(theta) * r,
      cy: anchor.cy + Math.sin(theta) * r,
      isNewest: f.id === newestId,
      color: accentForCategory(f.category, theme),
      ageDays,
    };
  });

  const edges: [Anchor, Anchor][] = [];
  const seen = new Set<string>();
  for (const a of anchors) {
    const others = anchors
      .filter((b) => b !== a)
      .map((b) => ({ b, d: Math.hypot(b.cx - a.cx, b.cy - a.cy) }))
      .sort((x, y) => x.d - y.d)
      .slice(0, 2);
    for (const { b } of others) {
      const key = [a.category, b.category].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([a, b]);
    }
  }

  const catEdges: CatEdge[] = [];
  const byCat = new Map<string, Node[]>();
  for (const n of nodes) {
    const arr = byCat.get(n.category) ?? [];
    arr.push(n);
    byCat.set(n.category, arr);
  }
  for (const [cat, list] of byCat) {
    if (list.length < 2) continue;
    const rand = mulberry32(hashId(cat));
    const edgeCount = Math.min(4, Math.max(2, Math.floor(list.length / 3)));
    for (let i = 0; i < edgeCount; i++) {
      const a = list[Math.floor(rand() * list.length)];
      const b = list[Math.floor(rand() * list.length)];
      if (!a || !b || a.id === b.id) continue;
      if (Math.hypot(a.cx - b.cx, a.cy - b.cy) > 160) continue;
      catEdges.push({
        a,
        b,
        phase: rand(),
        color: accentForCategory(cat, theme),
        category: cat,
      });
    }
  }

  let featuredPath: { category: string; nodes: Node[] } | null = null;
  const largest = [...byCat.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  if (largest && largest[1].length >= 4) {
    const [cat, list] = largest;
    const start = list[0];
    const chain: Node[] = [start];
    const remaining = list.slice(1);
    while (chain.length < 4 && remaining.length > 0) {
      const last = chain[chain.length - 1];
      remaining.sort(
        (a, b) =>
          Math.hypot(a.cx - last.cx, a.cy - last.cy) -
          Math.hypot(b.cx - last.cx, b.cy - last.cy),
      );
      chain.push(remaining.shift()!);
    }
    featuredPath = { category: cat, nodes: chain };
  }

  return { nodes, anchors, edges, catEdges, newestId, featuredPath };
}

interface Props {
  onFirstInteraction?: () => void;
  skipEntrance?: boolean;
  onSelect?: (feature: FeatureCard) => void;
}

export function HeroConstellation({ onFirstInteraction, skipEntrance = false, onSelect }: Props) {
  const { features } = useFeatures();
  const reduced = useReducedMotion() ?? false;
  const theme = useTheme();
  const isLight = theme === "light";
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const notifiedRef = useRef(false);

  const { nodes, anchors, edges, catEdges, featuredPath } = useMemo(
    () => buildGraph(features, theme),
    [features, theme],
  );

  const featuresById = useMemo(() => {
    const m = new Map<string, FeatureCard>();
    for (const f of features) m.set(f.id, f);
    return m;
  }, [features]);

  const activeId = hoverId ?? focusId;
  const activeNode = useMemo(
    () => (activeId ? nodes.find((n) => n.id === activeId) ?? null : null),
    [activeId, nodes],
  );
  const activeCategory = activeNode?.category ?? null;

  const notifyInteraction = () => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    onFirstInteraction?.();
  };

  // Featured pathway cycle
  const [pathwayStep, setPathwayStep] = useState(-1);
  useEffect(() => {
    if (reduced || skipEntrance || !featuredPath) return;
    let cancelled = false;
    const timers: number[] = [];
    timers.push(window.setTimeout(() => {
      if (cancelled) return;
      featuredPath.nodes.forEach((_, i) => {
        timers.push(window.setTimeout(() => {
          if (!cancelled) setPathwayStep(i);
        }, i * 550));
      });
      timers.push(window.setTimeout(() => {
        if (!cancelled) setPathwayStep(-1);
      }, featuredPath.nodes.length * 550 + 1600));
    }, 1800));
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [reduced, skipEntrance, featuredPath]);

  // Scroll-linked fade
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.35, 0]);

  // Cursor parallax
  const [supportsParallax, setSupportsParallax] = useState(false);
  useEffect(() => {
    if (reduced) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setSupportsParallax(true);
  }, [reduced]);

  const rawX = useSpring(0, { stiffness: 60, damping: 22, mass: 0.6 });
  const rawY = useSpring(0, { stiffness: 60, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (!supportsParallax) return;
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = (e.clientX / w) * 2 - 1;
      const ny = (e.clientY / h) * 2 - 1;
      rawX.set(nx * 8);
      rawY.set(ny * 6);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [supportsParallax, rawX, rawY]);

  const openStar = (n: Node) => {
    notifyInteraction();
    const feat = featuresById.get(n.id);
    if (feat && onSelect) onSelect(feat);
  };

  if (features.length === 0) return null;

  const pathwayIds = new Set((featuredPath?.nodes ?? []).map((n) => n.id));

  // Palette tuned per theme so filaments and rings pass AA-ish contrast on
  // either background without shouting. Light leans antique-gold so the sky
  // reads as an engraved star chart on cream, per the Refined Atlas plate.
  const anchorLine = isLight ? "rgba(140,116,51,0.30)" : "rgba(201,169,97,0.14)";
  const filamentLine = isLight ? "rgba(140,116,51,0.18)" : "rgba(31,122,90,0.10)";
  const anchorRing = isLight ? "rgba(107,84,35,0.5)" : "rgba(31,122,90,0.28)";
  const newestFill = isLight ? "#0B3D2E" : "#F5F0E8";
  const tooltipBg = isLight ? "rgba(20,28,24,0.94)" : "rgba(10,10,10,0.94)";
  const tooltipBorder = "#C9A961";
  const tooltipText = "#FBF5E9";
  // Cartographic dash for connector lines (light only) — engraved chart style.
  const edgeDash = isLight ? "3 5" : undefined;

  return (
    <motion.div
      ref={wrapperRef}
      aria-hidden={false}
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ opacity }}
    >
      <motion.svg
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ x: rawX, y: rawY }}
      >
        <defs>
          <radialGradient id="hc-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A961" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#C9A961" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Inter-category anchor connectors */}
        <g stroke={anchorLine} strokeWidth={0.6} strokeDasharray={edgeDash}>
          {edges.map(([a, b], i) => (
            <line key={i} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} />
          ))}
        </g>

        {/* Intra-category filaments */}
        <g strokeWidth={0.5} fill="none">
          {catEdges.map((e, i) => {
            const dur = 22 + (i % 5) * 4;
            const delay = -e.phase * dur;
            const dimmed = activeCategory && activeCategory !== e.category;
            const matched = activeCategory && activeCategory === e.category;
            const boost = matched ? 0.6 : dimmed ? 0.06 : isLight ? 0.4 : 0.28;
            return reduced ? (
              <line
                key={"ce-" + i}
                x1={e.a.cx}
                y1={e.a.cy}
                x2={e.b.cx}
                y2={e.b.cy}
                stroke={e.color}
                strokeOpacity={boost * 0.5}
              />
            ) : (
              <motion.line
                key={"ce-" + i}
                x1={e.a.cx}
                y1={e.a.cy}
                x2={e.b.cx}
                y2={e.b.cy}
                stroke={e.color}
                initial={{ strokeOpacity: 0 }}
                animate={
                  activeCategory
                    ? { strokeOpacity: boost }
                    : { strokeOpacity: [0, boost, boost, 0] }
                }
                transition={
                  activeCategory
                    ? { duration: 0.25 }
                    : {
                        duration: dur,
                        times: [0, 0.25, 0.75, 1],
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay,
                      }
                }
              />
            );
          })}
        </g>

        {/* Faint filaments — feature to category centroid */}
        <g stroke={filamentLine} strokeWidth={0.4}>
          {nodes.map((n) => {
            const anchor = anchors.find((a) => a.category === n.category);
            if (!anchor) return null;
            const dimmed = activeCategory && activeCategory !== n.category;
            return (
              <line
                key={n.id + "-fil"}
                x1={anchor.cx}
                y1={anchor.cy}
                x2={n.cx}
                y2={n.cy}
                opacity={dimmed ? 0.3 : 1}
                style={{ transition: "opacity 200ms ease-out" }}
              />
            );
          })}
        </g>

        {/* Featured pathway */}
        {featuredPath && !reduced && pathwayStep >= 0 && (
          <g stroke={accentForCategory(featuredPath.category, theme)} strokeWidth={0.9} fill="none">
            {featuredPath.nodes.slice(0, -1).map((n, i) => {
              const next = featuredPath.nodes[i + 1];
              const active = pathwayStep >= i + 1;
              return (
                <motion.line
                  key={"pw-" + i}
                  x1={n.cx}
                  y1={n.cy}
                  x2={next.cx}
                  y2={next.cy}
                  initial={{ strokeOpacity: 0 }}
                  animate={{ strokeOpacity: active ? 0.7 : 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              );
            })}
          </g>
        )}

        {/* Category anchor rings */}
        <g fill="none" stroke={anchorRing} strokeWidth={0.7}>
          {anchors.map((a) => (
            <circle key={a.category} cx={a.cx} cy={a.cy} r={3} />
          ))}
        </g>

        {/* Greek designations — engraved star-chart labels on the category
            anchors, like Bayer letters on a real celestial atlas. Purely
            decorative; screen readers skip them. */}
        <g
          aria-hidden
          fontFamily="'JetBrains Mono', ui-monospace, monospace"
          fontSize={11}
          fill={isLight ? "#6B5423" : "#C9A961"}
          fillOpacity={isLight ? 0.6 : 0.45}
          style={{ pointerEvents: "none" }}
        >
          {anchors.map((a, i) => (
            <text key={a.category} x={a.cx + 7} y={a.cy - 6}>
              {GREEK_LETTERS[i % GREEK_LETTERS.length]}
            </text>
          ))}
        </g>

        {/* Sparkle glyphs — every seventh star rendered as a four-point
            engraving spark (decorative, sits under the interactive layer). */}
        <g
          aria-hidden
          fill={isLight ? "#A8873F" : "#C9A961"}
          fillOpacity={isLight ? 0.55 : 0.3}
          style={{ pointerEvents: "none" }}
        >
          {nodes
            .filter((_, i) => i % 7 === 3)
            .map((n) => (
              <path
                key={"sp-" + n.id}
                d={`M ${n.cx} ${n.cy - 5} L ${n.cx + 1.4} ${n.cy - 1.4} L ${n.cx + 5} ${n.cy} L ${n.cx + 1.4} ${n.cy + 1.4} L ${n.cx} ${n.cy + 5} L ${n.cx - 1.4} ${n.cy + 1.4} L ${n.cx - 5} ${n.cy} L ${n.cx - 1.4} ${n.cy - 1.4} Z`}
              />
            ))}
        </g>

        {/* Interactive node layer */}
        <g style={{ pointerEvents: "auto" }}>
          {nodes.map((n) => {
            const isActive = activeId === n.id;
            const isSibling = activeCategory && activeCategory === n.category && !isActive;
            const isDimmed = activeCategory && activeCategory !== n.category;
            const inPathway = pathwayIds.has(n.id) && pathwayStep >= 0;
            const baseR = n.isNewest ? 2.6 : isLight ? 1.7 : 1.4;

            let fillOpacity = isLight ? 0.75 : 0.55;
            if (n.isNewest) fillOpacity = 0.98;
            else if (isActive) fillOpacity = 1;
            else if (isSibling) fillOpacity = isLight ? 0.95 : 0.85;
            else if (inPathway) fillOpacity = isLight ? 0.95 : 0.85;
            else if (isDimmed) fillOpacity = isLight ? 0.32 : 0.18;

            const ariaLabel = `${n.name}, ${n.category}. Open preview.`;

            return (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={ariaLabel}
                onPointerEnter={() => {
                  notifyInteraction();
                  setHoverId(n.id);
                }}
                onPointerLeave={() => setHoverId((h) => (h === n.id ? null : h))}
                onFocus={() => {
                  notifyInteraction();
                  setFocusId(n.id);
                }}
                onBlur={() => setFocusId((f) => (f === n.id ? null : f))}
                onClick={() => openStar(n)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openStar(n);
                  }
                }}
                style={{ cursor: "pointer", outline: "none" }}
              >
                <circle cx={n.cx} cy={n.cy} r={12} fill="transparent" />
                {n.isNewest && !reduced && (
                  <motion.circle
                    cx={n.cx}
                    cy={n.cy}
                    r={baseR}
                    fill="url(#hc-node-glow)"
                    animate={{ opacity: [0.3, 0.85, 0.3], scale: [1, 3.2, 1] }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
                  />
                )}
                <circle
                  cx={n.cx}
                  cy={n.cy}
                  r={isActive ? baseR + 1.8 : n.isNewest ? baseR + 0.4 : baseR}
                  fill={n.isNewest ? newestFill : n.color}
                  opacity={fillOpacity}
                  style={{ transition: "r 200ms ease-out, opacity 200ms ease-out" }}
                />
                {/* Focus ring — appears on keyboard focus */}
                {focusId === n.id && (
                  <circle
                    cx={n.cx}
                    cy={n.cy}
                    r={baseR + 4}
                    fill="none"
                    stroke="#C9A961"
                    strokeWidth={0.9}
                    opacity={0.9}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Tooltip pill — HTML rendered inside foreignObject so it inherits
            the SVG's slice-preserved viewport transform and lands exactly
            beside the active star in both themes. */}
        {activeNode && (
          <foreignObject
            x={Math.min(Math.max(activeNode.cx + 10, 0), VBW - 260)}
            y={Math.max(activeNode.cy - 44, 0)}
            width={260}
            height={56}
            style={{ pointerEvents: "none", overflow: "visible" }}
          >
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                gap: 2,
                padding: "8px 12px",
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: 8,
                boxShadow: "0 8px 20px -8px rgba(0,0,0,0.55)",
                fontFamily:
                  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                color: tooltipText,
                maxWidth: 240,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color: tooltipText,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {activeNode.name}
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: activeNode.color,
                }}
              >
                {activeNode.category}
              </span>
            </div>
          </foreignObject>
        )}
      </motion.svg>
    </motion.div>
  );
}
