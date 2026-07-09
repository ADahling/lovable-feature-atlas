import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Link, useNavigate } from "@tanstack/react-router";
import { useReducedMotion } from "framer-motion";
import { useFeatures } from "../../hooks/use-features";
import { tintForCategory } from "../../lib/category-theme";
import type { FeatureCard } from "../../lib/features.functions";

// ---------- Deterministic seeded RNG ----------

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

// ---------- Star layout ----------

interface StarData {
  feature: FeatureCard;
  position: THREE.Vector3;
  color: THREE.Color;
  scale: number;
  isBeta: boolean;
  isRecent: boolean;
}

const CLUSTER_RADIUS = 12;
const JITTER = 1.7;

function categoryAnchor(index: number, total: number): THREE.Vector3 {
  // Fibonacci sphere for even cluster distribution around origin.
  const phi = Math.acos(1 - (2 * (index + 0.5)) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
  return new THREE.Vector3(
    CLUSTER_RADIUS * Math.sin(phi) * Math.cos(theta),
    CLUSTER_RADIUS * Math.cos(phi),
    CLUSTER_RADIUS * Math.sin(phi) * Math.sin(theta),
  );
}

function buildStars(features: FeatureCard[]) {
  const cats = Array.from(new Set(features.map((f) => f.category))).sort();
  const anchors = new Map<string, THREE.Vector3>();
  cats.forEach((c, i) => anchors.set(c, categoryAnchor(i, cats.length)));

  const now = Date.now();
  const stars: StarData[] = features.map((f) => {
    const rand = mulberry32(hashId(f.id));
    const anchor = anchors.get(f.category)!;
    // Uniform point in a small ball around the anchor.
    const u = rand();
    const v = rand();
    const r = Math.cbrt(rand()) * JITTER;
    const th = 2 * Math.PI * u;
    const ph = Math.acos(2 * v - 1);
    const pos = anchor.clone().add(
      new THREE.Vector3(
        r * Math.sin(ph) * Math.cos(th),
        r * Math.sin(ph) * Math.sin(th),
        r * Math.cos(ph),
      ),
    );
    const releaseTs = f.releaseDate ? new Date(f.releaseDate).getTime() : 0;
    const ageDays = releaseTs ? (now - releaseTs) / 86400000 : 9999;
    const isRecent = ageDays >= 0 && ageDays <= 30;
    const isBeta = f.status === "Beta";
    const color = new THREE.Color(tintForCategory(f.category));
    if (isRecent) color.multiplyScalar(1.55);
    const scale = isRecent ? 1.6 : 1;
    return { feature: f, position: pos, color, scale, isBeta, isRecent };
  });
  return { stars, anchors };
}

// ---------- Instanced star field ----------

function StarField({
  stars,
  onHover,
  onSelect,
  reduceMotion,
}: {
  stars: StarData[];
  onHover: (s: StarData | null, screen: { x: number; y: number } | null) => void;
  onSelect: (s: StarData) => void;
  reduceMotion: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const baseScales = useMemo(() => stars.map((s) => s.scale * 0.16), [stars]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    stars.forEach((s, i) => {
      dummy.position.copy(s.position);
      dummy.scale.setScalar(baseScales[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, s.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [stars, dummy, baseScales]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh || reduceMotion) return;
    const t = clock.elapsedTime;
    let dirty = false;
    stars.forEach((s, i) => {
      if (!s.isBeta) return;
      const pulse = 1 + 0.35 * Math.sin(t * 1.8 + i * 0.7);
      dummy.position.copy(s.position);
      dummy.scale.setScalar(baseScales[i] * pulse);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      dirty = true;
    });
    if (dirty) mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, stars.length]}
      onPointerMove={(e) => {
        e.stopPropagation();
        const id = e.instanceId;
        if (id == null) return;
        onHover(stars[id], { x: e.clientX, y: e.clientY });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null, null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        const id = e.instanceId;
        if (id == null) return;
        onSelect(stars[id]);
      }}
    >
      <sphereGeometry args={[1, 14, 14]} />
      <meshBasicMaterial
        vertexColors
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ---------- Background dust (reuses hero starfield feel) ----------

function BackgroundDust({ reduce }: { reduce: boolean }) {
  const positions = useMemo(() => {
    const n = 900;
    const arr = new Float32Array(n * 3);
    const rand = mulberry32(9931);
    for (let i = 0; i < n; i++) {
      const r = 40 + rand() * 35;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      arr[i * 3 + 2] = r * Math.cos(ph);
    }
    return arr;
  }, []);
  const ref = useRef<THREE.Points>(null!);
  useFrame((_, delta) => {
    if (reduce || !ref.current) return;
    ref.current.rotation.y += delta * 0.008;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#C9A961"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ---------- Category labels ----------

function CategoryLabels({ anchors }: { anchors: Map<string, THREE.Vector3> }) {
  return (
    <>
      {Array.from(anchors.entries()).map(([name, pos]) => (
        <Html
          key={name}
          position={[pos.x, pos.y + 2.8, pos.z]}
          center
          distanceFactor={16}
          style={{ pointerEvents: "none" }}
          zIndexRange={[10, 0]}
        >
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.28em] text-cream/45">
            {name}
          </span>
        </Html>
      ))}
    </>
  );
}

// ---------- Root view ----------

export default function ConstellationView() {
  const { features } = useFeatures();
  const navigate = useNavigate();
  const reduceMotion = !!useReducedMotion();
  const { stars, anchors } = useMemo(() => buildStars(features), [features]);
  const [hover, setHover] = useState<
    { star: StarData; x: number; y: number } | null
  >(null);
  const pendingTap = useRef<string | null>(null);
  const tapTimer = useRef<number | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  const goToStar = (s: StarData) => {
    const nav = () =>
      navigate({ to: "/features/$slug", params: { slug: s.feature.id } });
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !reduceMotion
    ) {
      (document as unknown as {
        startViewTransition: (cb: () => void) => void;
      }).startViewTransition(nav);
    } else {
      nav();
    }
  };

  const handleSelect = (s: StarData) => {
    if (!isTouch) {
      goToStar(s);
      return;
    }
    // Mobile: first tap reveals tooltip, second confirms navigation.
    if (pendingTap.current === s.feature.id) {
      if (tapTimer.current) window.clearTimeout(tapTimer.current);
      pendingTap.current = null;
      goToStar(s);
      return;
    }
    pendingTap.current = s.feature.id;
    setHover({
      star: s,
      x: window.innerWidth / 2,
      y: Math.max(80, window.innerHeight * 0.18),
    });
    if (tapTimer.current) window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => {
      pendingTap.current = null;
    }, 2500);
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-ink">
      <Canvas
        camera={{ position: [0, 3, 34], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        style={{
          background:
            "radial-gradient(circle at 50% 55%, #0d2118 0%, #0A0A0A 65%)",
        }}
      >
        <ambientLight intensity={0.5} />
        <BackgroundDust reduce={reduceMotion} />
        <StarField
          stars={stars}
          onHover={(s, sc) =>
            setHover(s && sc ? { star: s, x: sc.x, y: sc.y } : null)
          }
          onSelect={handleSelect}
          reduceMotion={reduceMotion}
        />
        <CategoryLabels anchors={anchors} />
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
          zoomSpeed={0.7}
          minDistance={14}
          maxDistance={70}
          autoRotate={!reduceMotion}
          autoRotateSpeed={0.22}
        />
      </Canvas>

      {/* Intro overline */}
      <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center px-6 sm:top-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cream/55 sm:text-[11px]">
          The atlas, as a sky — every feature a star.
        </p>
      </div>

      {/* Back link */}
      <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8">
        <Link
          to="/"
          className="font-mono text-[11px] uppercase tracking-[0.28em] text-cream/65 transition-colors hover:text-gold"
        >
          ← Back to grid
        </Link>
      </div>

      {/* Legend */}
      <div className="absolute bottom-5 left-5 z-10 space-y-2 rounded-md border border-cream/10 bg-ink/70 p-4 backdrop-blur-sm sm:bottom-8 sm:left-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cream/50">
          Legend
        </p>
        <div className="flex items-center gap-2 font-mono text-[11px] text-cream/75">
          <span className="inline-block h-2 w-2 rounded-full bg-[#C9A961]" />
          GA — steady
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-cream/75">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald" />
          Beta — pulsing
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-cream/75">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_10px_rgba(201,169,97,0.9)]" />
          Shipped in last 30 days — brighter
        </div>
      </div>

      {/* Hint */}
      <div className="pointer-events-none absolute bottom-5 right-5 z-10 hidden max-w-[220px] text-right font-mono text-[10px] uppercase tracking-[0.24em] text-cream/40 sm:block sm:bottom-8 sm:right-8">
        Drag to orbit · scroll to zoom · click a star
      </div>

      {/* Tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md border border-cream/15 bg-ink/85 px-3 py-2 backdrop-blur-sm"
          style={{ left: hover.x, top: hover.y - 14 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/55">
            {hover.star.feature.category} · {hover.star.feature.status}
          </p>
          <p className="text-sm font-medium text-cream">
            {hover.star.feature.name}
          </p>
          {isTouch && (
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-gold/70">
              Tap again to open
            </p>
          )}
        </div>
      )}
    </div>
  );
}
