import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useReducedMotion, useScroll, useSpring, useTransform, motion, useMotionValue, animate } from "framer-motion";
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

function buildGraph(features: FeatureCard[]): {
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

  // Find newest by releaseDate (single most-recent feature) — only that
  // one gets the arrival pulse. Prior behavior pulsed every feature <=14d
  // old which visually competed with the true newest.
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
        category: cat,
      });
    }
  }

  // Featured pathway — a small chain of same-category nodes we brighten
  // in sequence once on first load so the graph reads as *narrative*, not
  // just decoration. Pick the largest cluster, then walk 4 nearest neighbors.
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
}

export function HeroConstellation({ onFirstInteraction, skipEntrance = false }: Props) {
  const { features } = useFeatures();
  const navigate = useNavigate();
  const reduced = useReducedMotion() ?? false;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [clickTarget, setClickTarget] = useState<{ cx: number; cy: number; slug: string } | null>(null);
  const notifiedRef = useRef(false);

  const { nodes, anchors, edges, catEdges, featuredPath } = useMemo(
    () => buildGraph(features),
    [features],
  );

  const hoverCategory = useMemo(() => {
    if (!hoverId) return null;
    return nodes.find((n) => n.id === hoverId)?.category ?? null;
  }, [hoverId, nodes]);

  const notifyInteraction = () => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    onFirstInteraction?.();
  };

  // Featured pathway: cycle a "brighten" index along the chain once,
  // pause, then let it fade. Runs on mount, not on repeat.
  const [pathwayStep, setPathwayStep] = useState(-1);
  useEffect(() => {
    if (reduced || skipEntrance || !featuredPath) return;
    let cancelled = false;
    const timers: number[] = [];
    // Start after hero copy has settled (~1.8s).
    timers.push(window.setTimeout(() => {
      if (cancelled) return;
      featuredPath.nodes.forEach((_, i) => {
        timers.push(window.setTimeout(() => {
          if (!cancelled) setPathwayStep(i);
        }, i * 550));
      });
      // Fade out after chain completes
      timers.push(window.setTimeout(() => {
        if (!cancelled) setPathwayStep(-1);
      }, featuredPath.nodes.length * 550 + 1600));
    }, 1800));
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [reduced, skipEntrance, featuredPath]);

  // Scroll-linked fade.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.35, 0]);

  // Cursor parallax.
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

  // Cinematic click — a scale-toward-target glide on the whole SVG before
  // navigation. ~400ms, skipped when reduced-motion is on.
  const zoomScale = useMotionValue(1);
  const zoomOpacity = useMotionValue(1);
  const originX = useMotionValue(50);
  const originY = useMotionValue(50);

  const handleNodeClick = (n: Node) => {
    notifyInteraction();
    if (reduced) {
      void navigate({ to: "/features/$slug", params: { slug: n.slug } });
      return;
    }
    setClickTarget({ cx: n.cx, cy: n.cy, slug: n.slug });
    originX.set((n.cx / VBW) * 100);
    originY.set((n.cy / VBH) * 100);
    animate(zoomScale, 2.4, { duration: 0.4, ease: [0.4, 0, 0.2, 1] });
    animate(zoomOpacity, 0, { duration: 0.4, ease: [0.4, 0, 0.2, 1] });
    window.setTimeout(() => {
      void navigate({ to: "/features/$slug", params: { slug: n.slug } });
    }, 380);
  };

  if (features.length === 0) return null;

  const pathwayIds = new Set((featuredPath?.nodes ?? []).map((n) => n.id));

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
        style={{
          x: rawX,
          y: rawY,
          scale: zoomScale,
          opacity: zoomOpacity,
          transformOrigin: useTransform(
            [originX, originY],
            ([x, y]) => `${x}% ${y}%`,
          ) as unknown as string,
        }}
      >
        <defs>
          <radialGradient id="hc-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A961" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#C9A961" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Inter-category anchor connectors */}
        <g stroke="rgba(201,169,97,0.14)" strokeWidth={0.6}>
          {edges.map(([a, b], i) => (
            <line key={i} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} />
          ))}
        </g>

        {/* Intra-category filaments — dim when a different category is hovered. */}
        <g strokeWidth={0.5} fill="none">
          {catEdges.map((e, i) => {
            const dur = 22 + (i % 5) * 4;
            const delay = -e.phase * dur;
            const dimmed = hoverCategory && hoverCategory !== e.category;
            const matched = hoverCategory && hoverCategory === e.category;
            const boost = matched ? 0.55 : dimmed ? 0.06 : 0.28;
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
                  hoverCategory
                    ? { strokeOpacity: boost }
                    : { strokeOpacity: [0, boost, boost, 0] }
                }
                transition={
                  hoverCategory
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
        <g stroke="rgba(31,122,90,0.10)" strokeWidth={0.4}>
          {nodes.map((n) => {
            const anchor = anchors.find((a) => a.category === n.category);
            if (!anchor) return null;
            const dimmed = hoverCategory && hoverCategory !== n.category;
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

        {/* Featured pathway — sequential brightening on first load */}
        {featuredPath && !reduced && pathwayStep >= 0 && (
          <g stroke={tintForCategory(featuredPath.category)} strokeWidth={0.9} fill="none">
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
        <g fill="none" stroke="rgba(31,122,90,0.28)" strokeWidth={0.7}>
          {anchors.map((a) => (
            <circle key={a.category} cx={a.cx} cy={a.cy} r={3} />
          ))}
        </g>

        {/* Interactive node layer */}
        <g style={{ pointerEvents: "auto" }}>
          {nodes.map((n) => {
            const isHover = hoverId === n.id;
            const isSibling = hoverCategory && hoverCategory === n.category && !isHover;
            const isDimmed = hoverCategory && hoverCategory !== n.category;
            const inPathway = pathwayIds.has(n.id) && pathwayStep >= 0;
            const baseR = n.isNewest ? 2.6 : 1.4;

            let fillOpacity = 0.55;
            if (n.isNewest) fillOpacity = 0.95;
            else if (isHover) fillOpacity = 0.95;
            else if (isSibling) fillOpacity = 0.85;
            else if (inPathway) fillOpacity = 0.85;
            else if (isDimmed) fillOpacity = 0.18;

            return (
              <g
                key={n.id}
                onPointerEnter={() => {
                  notifyInteraction();
                  setHoverId(n.id);
                }}
                onPointerLeave={() => setHoverId((h) => (h === n.id ? null : h))}
                onClick={() => handleNodeClick(n)}
                style={{ cursor: "pointer" }}
              >
                <circle cx={n.cx} cy={n.cy} r={10} fill="transparent" />
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
                  r={isHover ? baseR + 1.6 : n.isNewest ? baseR + 0.4 : baseR}
                  fill={n.isNewest ? "#F5F0E8" : n.color}
                  opacity={fillOpacity}
                  style={{ transition: "r 200ms ease-out, opacity 200ms ease-out" }}
                />
                {isHover && (
                  <g pointerEvents="none">
                    <text
                      x={n.cx + 8}
                      y={n.cy - 10}
                      fill="#F5F0E8"
                      fontSize={10.5}
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      style={{
                        letterSpacing: "0.02em",
                        paintOrder: "stroke",
                        stroke: "rgba(10,10,10,0.85)",
                        strokeWidth: 3,
                        fontWeight: 500,
                      }}
                    >
                      {n.name}
                    </text>
                    <text
                      x={n.cx + 8}
                      y={n.cy + 2}
                      fill={n.color}
                      fontSize={8.5}
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      style={{
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        paintOrder: "stroke",
                        stroke: "rgba(10,10,10,0.85)",
                        strokeWidth: 2.5,
                      }}
                    >
                      {n.category}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </motion.svg>
      {/* clickTarget kept for future hooks — suppress unused var */}
      {clickTarget ? null : null}
    </motion.div>
  );
}
