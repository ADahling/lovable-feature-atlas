import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useReducedMotion, useScroll, useSpring, useTransform, motion } from "framer-motion";
import { useFeatures } from "../../hooks/use-features";
import { tintForCategory } from "../../lib/category-theme";
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
const RECENT_WINDOW_DAYS = 30;

interface Node {
  id: string;
  slug: string;
  name: string;
  category: string;
  cx: number;
  cy: number;
  recent: boolean;
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
}

function buildGraph(features: FeatureCard[]): {
  nodes: Node[];
  anchors: Anchor[];
  edges: [Anchor, Anchor][];
  catEdges: CatEdge[];
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
      recent: ageDays >= 0 && ageDays <= 14,
      color: tintForCategory(f.category),
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

  // Intra-category filament edges — connect a handful of nodes within
  // each category. Each edge gets a deterministic phase so the fade
  // in/out cycles are staggered across tens of seconds.
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
        color: tintForCategory(cat),
      });
    }
  }

  return { nodes, anchors, edges, catEdges };
}

export function HeroConstellation() {
  const { features } = useFeatures();
  const navigate = useNavigate();
  const reduced = useReducedMotion() ?? false;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const { nodes, anchors, edges, catEdges } = useMemo(() => buildGraph(features), [features]);

  // Scroll-linked fade — dies gracefully as the user reads into the catalog.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.35, 0]);

  // Cursor parallax — a few px, spring-damped. Skip when reduced or on touch.
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

  if (features.length === 0) return null;

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

        {/* Fine connecting lines between related category anchors */}
        <g stroke="rgba(201,169,97,0.14)" strokeWidth={0.6}>
          {edges.map(([a, b], i) => (
            <line key={i} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} />
          ))}
        </g>

        {/* Intra-category connecting filaments — slow fade in/out over
            tens of seconds, staggered by per-edge phase. Static under
            prefers-reduced-motion. */}
        <g strokeWidth={0.5} fill="none">
          {catEdges.map((e, i) => {
            const dur = 22 + (i % 5) * 4; // 22–38s per cycle
            const delay = -e.phase * dur;
            return reduced ? (
              <line
                key={"ce-" + i}
                x1={e.a.cx}
                y1={e.a.cy}
                x2={e.b.cx}
                y2={e.b.cy}
                stroke={e.color}
                strokeOpacity={0.14}
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
                animate={{ strokeOpacity: [0, 0.28, 0.28, 0] }}
                transition={{
                  duration: dur,
                  times: [0, 0.25, 0.75, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
              />
            );
          })}
        </g>

        {/* Faint filaments — each feature to its category centroid */}
        <g stroke="rgba(31,122,90,0.10)" strokeWidth={0.4}>
          {nodes.map((n) => {
            const anchor = anchors.find((a) => a.category === n.category);
            if (!anchor) return null;
            return (
              <line
                key={n.id + "-fil"}
                x1={anchor.cx}
                y1={anchor.cy}
                x2={n.cx}
                y2={n.cy}
              />
            );
          })}
        </g>

        {/* Category anchor rings — quiet emerald hairlines */}
        <g fill="none" stroke="rgba(31,122,90,0.28)" strokeWidth={0.7}>
          {anchors.map((a) => (
            <circle key={a.category} cx={a.cx} cy={a.cy} r={3} />
          ))}
        </g>

        {/* Interactive layer — nodes get pointer events */}
        <g style={{ pointerEvents: "auto" }}>
          {nodes.map((n) => {
            const isHover = hoverId === n.id;
            const baseR = n.recent ? 2.4 : 1.4;
            return (
              <g
                key={n.id}
                onPointerEnter={() => setHoverId(n.id)}
                onPointerLeave={() => setHoverId((h) => (h === n.id ? null : h))}
                onClick={() => {
                  void navigate({ to: "/features/$slug", params: { slug: n.slug } });
                }}
                style={{ cursor: "pointer" }}
              >
                {/* Larger transparent hit target for tap accuracy */}
                <circle cx={n.cx} cy={n.cy} r={10} fill="transparent" />
                {n.recent && !reduced && (
                  <motion.circle
                    cx={n.cx}
                    cy={n.cy}
                    r={baseR}
                    fill="url(#hc-node-glow)"
                    animate={{ opacity: [0.25, 0.7, 0.25], scale: [1, 2.6, 1] }}
                    transition={{
                      duration: 3.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: (hashId(n.id) % 100) / 40,
                    }}
                    style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
                  />
                )}
                <circle
                  cx={n.cx}
                  cy={n.cy}
                  r={isHover ? baseR + 1.4 : baseR}
                  fill={n.recent ? "#F5F0E8" : n.color}
                  opacity={n.recent ? 0.95 : isHover ? 0.9 : 0.55}
                  style={{ transition: "r 200ms ease-out, opacity 200ms ease-out" }}
                />
                {isHover && (
                  <text
                    x={n.cx + 8}
                    y={n.cy - 8}
                    fill="#F5F0E8"
                    fontSize={10}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    style={{ letterSpacing: "0.02em", paintOrder: "stroke", stroke: "rgba(10,10,10,0.8)", strokeWidth: 3 }}
                  >
                    {n.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </motion.svg>
    </motion.div>
  );
}
