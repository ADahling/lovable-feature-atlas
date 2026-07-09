import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useFeatures } from "../../hooks/use-features";
import { tintForCategory } from "../../lib/category-theme";
import type { FeatureCard } from "../../lib/features.functions";
import {
  createSoundEngine,
  readSoundPref,
  writeSoundPref,
  type SoundEngine,
} from "../../lib/constellation-sound";
import { StardustCursor } from "./StardustCursor";
import { useTiltParallax } from "../../lib/use-tilt-parallax";

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
  isRecent: boolean; // shipped in last 30 days (brighter halo)
  isNewborn: boolean; // shipped in last 7 days (star-birth animation)
  ageDays: number;
}

const CLUSTER_RADIUS = 12;
const JITTER = 1.7;
const NEWBORN_WINDOW_DAYS = 7;

function categoryAnchor(index: number, total: number): THREE.Vector3 {
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
    const isNewborn = ageDays >= 0 && ageDays <= NEWBORN_WINDOW_DAYS;
    const isBeta = f.status === "Beta";
    const color = new THREE.Color(tintForCategory(f.category));
    if (isRecent) color.multiplyScalar(1.55);
    const scale = isRecent ? 1.6 : 1;
    return {
      feature: f,
      position: pos,
      color,
      scale,
      isBeta,
      isRecent,
      isNewborn,
      ageDays,
    };
  });
  return { stars, anchors };
}

// ---------- Seen-newborn persistence ----------

const NEWBORN_LS_KEY = "atlas-seen-newborn-ids";

function loadSeenNewborns(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(NEWBORN_LS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveSeenNewborns(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      NEWBORN_LS_KEY,
      JSON.stringify(Array.from(ids)),
    );
  } catch {
    /* ignore */
  }
}

// ---------- Instanced star field with birth animation ----------

interface BirthAnim {
  index: number;
  startPos: THREE.Vector3;
  delay: number; // seconds from birth-start
  travel: number; // seconds of streak
  bloomEnd: number; // seconds from start
}

function StarField({
  stars,
  births,
  birthStartMs,
  onHover,
  onSelect,
  reduceMotion,
  onNewbornArrival,
}: {
  stars: StarData[];
  births: BirthAnim[];
  birthStartMs: number | null;
  onHover: (s: StarData | null, screen: { x: number; y: number } | null) => void;
  onSelect: (s: StarData) => void;
  reduceMotion: boolean;
  onNewbornArrival: (index: number) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const baseScales = useMemo(() => stars.map((s) => s.scale * 0.16), [stars]);
  const birthByIndex = useMemo(() => {
    const m = new Map<number, BirthAnim>();
    births.forEach((b) => m.set(b.index, b));
    return m;
  }, [births]);
  const notifiedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    notifiedRef.current = new Set();
  }, [birthStartMs, births]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    stars.forEach((s, i) => {
      // If this star has a pending birth and reduced motion is off, hide it
      // at t0 so it can streak in during the birth window.
      const hasBirth =
        !reduceMotion && birthStartMs != null && birthByIndex.has(i);
      dummy.position.copy(hasBirth ? new THREE.Vector3(0, -400, 0) : s.position);
      dummy.scale.setScalar(hasBirth ? 0 : baseScales[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, s.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [stars, dummy, baseScales, birthByIndex, birthStartMs, reduceMotion]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    let dirty = false;
    const nowMs = performance.now();

    // Beta pulse (always on unless reduced-motion).
    stars.forEach((s, i) => {
      const birth = birthByIndex.get(i);
      if (birth && birthStartMs != null && !reduceMotion) {
        const localT = (nowMs - birthStartMs) / 1000 - birth.delay;
        if (localT < 0) {
          // still hidden
          dummy.position.set(0, -400, 0);
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          dirty = true;
          return;
        }
        if (localT < birth.travel) {
          // Streak: ease-out from startPos → final. Overshoot slightly then settle.
          const p = Math.min(1, localT / birth.travel);
          const eased = 1 - Math.pow(1 - p, 3.2);
          const lerp = new THREE.Vector3().lerpVectors(
            birth.startPos,
            s.position,
            eased,
          );
          // Bloom scale: overshoot to 2.4x baseline mid-arrival, settle to base.
          const bloom = 0.3 + 2.1 * Math.sin(Math.min(Math.PI, eased * Math.PI));
          dummy.position.copy(lerp);
          dummy.scale.setScalar(baseScales[i] * (0.5 + 0.5 * eased) * (1 + 0.6 * bloom));
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          dirty = true;
          return;
        }
        // Post-arrival soft bloom pulse for ~1.2s.
        const settle = localT - birth.travel;
        if (settle < 1.2) {
          if (!notifiedRef.current.has(i)) {
            notifiedRef.current.add(i);
            onNewbornArrival(i);
          }
          const pulse = 1 + 0.6 * Math.exp(-settle * 3.2) * Math.cos(settle * 5);
          dummy.position.copy(s.position);
          dummy.scale.setScalar(baseScales[i] * pulse);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          dirty = true;
          return;
        }
      }
      if (!s.isBeta || reduceMotion) return;
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

// ---------- Background dust ----------

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

  // -------- Star birth choreography --------
  // Decide which newborn stars deserve the streak-in animation on this
  // visit. A star is animated when it's within the newborn window AND
  // hasn't been "seen" (persisted to localStorage) yet. After the birth
  // sequence completes we commit the current set of newborn IDs so the
  // ceremony doesn't replay on refresh — but a fresh newborn from the
  // self-updating pipeline will animate on the next visit.
  const [births, setBirths] = useState<BirthAnim[]>([]);
  const [birthStartMs, setBirthStartMs] = useState<number | null>(null);
  const [birthLabelCount, setBirthLabelCount] = useState<number>(0);
  const seenNewbornsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    seenNewbornsRef.current = loadSeenNewborns();
  }, []);

  useEffect(() => {
    if (stars.length === 0) return;
    if (reduceMotion) {
      // No animation under reduced-motion; still commit the seen set so
      // returning without reduced-motion won't reveal old news.
      const currentNewborns = stars.filter((s) => s.isNewborn).map((s) => s.feature.id);
      const next = new Set(seenNewbornsRef.current);
      currentNewborns.forEach((id) => next.add(id));
      seenNewbornsRef.current = next;
      saveSeenNewborns(next);
      return;
    }
    const seen = seenNewbornsRef.current;
    const eligibleIdx: number[] = [];
    stars.forEach((s, i) => {
      if (s.isNewborn && !seen.has(s.feature.id)) eligibleIdx.push(i);
    });
    if (eligibleIdx.length === 0) return;

    // Stagger over ~2.5s. Each star gets a random start position far off
    // to the side + up/out so streaks read as arrivals, not centered spawns.
    const rand = mulberry32(hashId(eligibleIdx.map((i) => stars[i].feature.id).join("|")));
    const list: BirthAnim[] = eligibleIdx.map((idx, k) => {
      const delay = (k / Math.max(1, eligibleIdx.length - 1)) * 1.6;
      // A start position on a large sphere, biased so the streak travels
      // *toward* the final position from a plausible off-screen direction.
      const dir = stars[idx].position.clone().normalize();
      const offAxis = new THREE.Vector3(
        rand() - 0.5,
        rand() - 0.5,
        rand() - 0.5,
      ).normalize();
      const startDir = dir.lerp(offAxis, 0.55 + rand() * 0.3).normalize();
      const startPos = startDir.multiplyScalar(70 + rand() * 20);
      return {
        index: idx,
        startPos,
        delay,
        travel: 0.7 + rand() * 0.35,
        bloomEnd: 1.9,
      };
    });
    setBirths(list);
    setBirthLabelCount(eligibleIdx.length);
    setBirthStartMs(performance.now() + 260); // small breath before ceremony
    // Commit the seen set only after the total sequence resolves.
    const totalMs = 260 + 2500 + 1200;
    const commitTimer = window.setTimeout(() => {
      const next = new Set(seen);
      eligibleIdx.forEach((i) => next.add(stars[i].feature.id));
      seenNewbornsRef.current = next;
      saveSeenNewborns(next);
    }, totalMs);
    return () => window.clearTimeout(commitTimer);
  }, [stars, reduceMotion]);

  // Hide the caption after a while.
  const [showBirthLabel, setShowBirthLabel] = useState(false);
  useEffect(() => {
    if (birthLabelCount === 0) return;
    setShowBirthLabel(true);
    const t = window.setTimeout(() => setShowBirthLabel(false), 8500);
    return () => window.clearTimeout(t);
  }, [birthLabelCount, birthStartMs]);

  // -------- Sound engine --------
  const [soundOn, setSoundOn] = useState(false);
  const soundRef = useRef<SoundEngine | null>(null);
  const soundLoadingRef = useRef(false);

  useEffect(() => {
    setSoundOn(readSoundPref());
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function ensureEngine() {
      if (!soundOn) {
        if (soundRef.current) {
          soundRef.current.stopAmbient();
        }
        return;
      }
      if (soundRef.current) {
        soundRef.current.ambient();
        return;
      }
      if (soundLoadingRef.current) return;
      soundLoadingRef.current = true;
      try {
        const eng = await createSoundEngine();
        if (cancelled) {
          await eng.dispose();
          return;
        }
        soundRef.current = eng;
        eng.ambient();
      } finally {
        soundLoadingRef.current = false;
      }
    }
    ensureEngine();
    return () => {
      cancelled = true;
    };
  }, [soundOn]);

  useEffect(() => {
    return () => {
      const eng = soundRef.current;
      soundRef.current = null;
      if (eng) void eng.dispose();
    };
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      const next = !v;
      writeSoundPref(next);
      return next;
    });
  }, []);

  // -------- Navigation --------
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

  // -------- Hover -> tick sound (throttled inside engine) --------
  const lastHoverIdRef = useRef<string | null>(null);
  const handleHover = useCallback(
    (s: StarData | null, sc: { x: number; y: number } | null) => {
      setHover(s && sc ? { star: s, x: sc.x, y: sc.y } : null);
      const id = s?.feature.id ?? null;
      if (id && id !== lastHoverIdRef.current) {
        lastHoverIdRef.current = id;
        if (soundOn && soundRef.current) soundRef.current.tick();
      } else if (!id) {
        lastHoverIdRef.current = null;
      }
    },
    [soundOn],
  );

  // Play a chime as each newborn star arrives. We debounce identical
  // callbacks (StarField calls once per instance) and only chime while
  // the birth window is open.
  const chimeCountRef = useRef(0);
  const handleNewbornArrival = useCallback(
    (_i: number) => {
      chimeCountRef.current += 1;
      if (!soundOn || !soundRef.current) return;
      // Cap chime count to avoid a piano-fall on huge weekly batches.
      if (chimeCountRef.current > 6) return;
      soundRef.current.chime();
    },
    [soundOn],
  );

  // Device-orientation parallax — on phones with orientation sensors, tilting
  // the device subtly orbits the sky. Applied as a CSS 3D perspective on the
  // canvas wrapper so we don't fight OrbitControls. iOS requires an explicit
  // gesture, which we surface as a tap prompt in the legend area.
  const tilt = useTiltParallax({ pointer: false });
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const gyroWrapStyle: React.CSSProperties = reduceMotion
    ? {}
    : {
        transform: `perspective(1200px) rotateX(${(-tilt.y * 4).toFixed(3)}deg) rotateY(${(tilt.x * 6).toFixed(3)}deg)`,
        transformOrigin: "50% 50%",
        transition: "transform 220ms ease-out",
        willChange: "transform",
      };
  const showTiltPrompt = tilt.permissionState === "prompt";

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-ink">
      <div ref={canvasWrapRef} className="absolute inset-0" style={gyroWrapStyle}>
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
            births={births}
            birthStartMs={birthStartMs}
            onHover={handleHover}
            onSelect={handleSelect}
            reduceMotion={reduceMotion}
            onNewbornArrival={handleNewbornArrival}
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
      </div>

      {/* Stardust cursor overlay — desktop pointer only */}
      <StardustCursor disabled={isTouch} />

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

      {/* Legend + sound toggle */}
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
        <div className="pt-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            className="inline-flex items-center gap-2 rounded border border-cream/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-cream/70 transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            {soundOn ? (
              <Volume2 className="size-3.5" aria-hidden />
            ) : (
              <VolumeX className="size-3.5" aria-hidden />
            )}
            Sound · {soundOn ? "on" : "off"}
          </button>
        </div>
        {showTiltPrompt && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                void tilt.requestPermission();
              }}
              className="inline-flex items-center gap-2 rounded border border-cream/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-cream/70 transition-colors hover:border-gold/60 hover:text-gold"
            >
              Enable tilt parallax
            </button>
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="pointer-events-none absolute bottom-5 right-5 z-10 hidden max-w-[220px] text-right font-mono text-[10px] uppercase tracking-[0.24em] text-cream/40 sm:block sm:bottom-8 sm:right-8">
        Drag to orbit · scroll to zoom · click a star
      </div>

      {/* Newborn caption — bottom-left ABOVE the legend, transient. */}
      <AnimatePresence>
        {showBirthLabel && birthLabelCount > 0 && (
          <motion.div
            key="birth-caption"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="pointer-events-none absolute bottom-52 left-5 z-10 sm:bottom-56 sm:left-8"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold/85">
              {birthLabelCount} new star{birthLabelCount === 1 ? "" : "s"} this week
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
