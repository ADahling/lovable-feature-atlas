import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
    // Warm planetarium palette: category tint is retained, but pulled toward
    // cream/gold and overdriven because tiny additive stars otherwise read as
    // black after production renderer/color-management transforms.
    const tint = new THREE.Color(tintForCategory(f.category));
    const warmBase = new THREE.Color(isRecent ? "#F5F0E8" : "#EAD9AA");
    const color = tint.lerp(warmBase, isRecent ? 0.82 : 0.68).multiplyScalar(
      isRecent ? 5.8 : 4.6,
    );
    const scale = isRecent ? 1.85 : 1.08;
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
  const pointsRef = useRef<THREE.Points>(null!);
  const geometryRef = useRef<THREE.BufferGeometry>(null!);
  const positionsRef = useRef<Float32Array>(new Float32Array(stars.length * 3));
  const colorsRef = useRef<Float32Array>(new Float32Array(stars.length * 3));
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
    positionsRef.current = new Float32Array(stars.length * 3);
    colorsRef.current = new Float32Array(stars.length * 3);
    stars.forEach((s, i) => {
      // If this star has a pending birth and reduced motion is off, hide it
      // at t0 so it can streak in during the birth window.
      const hasBirth =
        !reduceMotion && birthStartMs != null && birthByIndex.has(i);
      const p = hasBirth ? new THREE.Vector3(0, -400, 0) : s.position;
      positionsRef.current[i * 3] = p.x;
      positionsRef.current[i * 3 + 1] = p.y;
      positionsRef.current[i * 3 + 2] = p.z;
      colorsRef.current[i * 3] = s.color.r;
      colorsRef.current[i * 3 + 1] = s.color.g;
      colorsRef.current[i * 3 + 2] = s.color.b;
    });
    const geo = geometryRef.current;
    if (!geo) return;
    geo.setAttribute("position", new THREE.BufferAttribute(positionsRef.current, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colorsRef.current, 3));
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  }, [stars, birthByIndex, birthStartMs, reduceMotion]);

  useFrame(({ clock }) => {
    const geo = geometryRef.current;
    if (!geo) return;
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
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
          pos.setXYZ(i, 0, -400, 0);
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
          pos.setXYZ(i, lerp.x, lerp.y, lerp.z);
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
          const drift = 0.04 * Math.exp(-settle * 3.2) * Math.cos(settle * 5);
          pos.setXYZ(i, s.position.x, s.position.y + drift, s.position.z);
          dirty = true;
          return;
        }
      }
      if (!s.isBeta || reduceMotion) return;
      const pulse = 0.04 * Math.sin(t * 1.8 + i * 0.7);
      pos.setXYZ(i, s.position.x, s.position.y + pulse, s.position.z);
      dirty = true;
    });
    if (dirty) pos.needsUpdate = true;
  });

  return (
    <points
      ref={pointsRef}
      onPointerMove={(e) => {
        e.stopPropagation();
        const id = e.index;
        if (id == null) return;
        onHover(stars[id], { x: e.clientX, y: e.clientY });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null, null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        const id = e.index;
        if (id == null) return;
        onSelect(stars[id]);
      }}
    >
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positionsRef.current, 3]} />
        <bufferAttribute attach="attributes-color" args={[colorsRef.current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        toneMapped={false}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
        size={0.01}
        sizeAttenuation={false}
      />
    </points>
  );
}

function SkyRasterOverlay({
  stars,
  anchors,
  reduce,
}: {
  stars: StarData[];
  anchors: Map<string, THREE.Vector3>;
  reduce: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let disposed = false;
    const fov = (55 * Math.PI) / 180;
    const cameraY = 3;
    const cameraZ = 34;
    const tan = Math.tan(fov / 2);
    const cream = { r: 245, g: 240, b: 232 };
    const gold = { r: 201, g: 169, b: 97 };

    const sizeCanvas = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h, dpr };
    };

    const project = (p: THREE.Vector3, rot: number, w: number, h: number) => {
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const x = p.x * cos - p.z * sin;
      const z = p.x * sin + p.z * cos;
      const y = p.y;
      const depth = cameraZ - z;
      if (depth <= 1) return null;
      const aspect = w / h;
      const ndcX = x / (depth * tan * aspect);
      const ndcY = (y - cameraY) / (depth * tan);
      return {
        x: (ndcX * 0.5 + 0.5) * w,
        y: (-ndcY * 0.5 + 0.5) * h,
        depth,
      };
    };

    const drawStar = (
      x: number,
      y: number,
      radius: number,
      tint: string,
      recent: boolean,
      beta: boolean,
      pulse: number,
    ) => {
      const inner = recent ? cream : gold;
      const halo = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.8);
      halo.addColorStop(0, `rgba(${inner.r},${inner.g},${inner.b},${1 * pulse})`);
      halo.addColorStop(0.22, `rgba(${cream.r},${cream.g},${cream.b},${0.62 * pulse})`);
      halo.addColorStop(0.55, `${tint}${recent ? "AA" : beta ? "88" : "66"}`);
      halo.addColorStop(1, "rgba(10,10,10,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${cream.r},${cream.g},${cream.b},${recent ? 1 : 0.92})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (time: number) => {
      if (disposed) return;
      const { w, h } = sizeCanvas();
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const rot = reduce ? 0 : time * 0.000035;

      stars.forEach((s, i) => {
        const p = project(s.position, rot, w, h);
        if (!p || p.x < -60 || p.x > w + 60 || p.y < -60 || p.y > h + 60) return;
        const betaPulse = s.isBeta && !reduce ? 1 + 0.18 * Math.sin(time * 0.002 + i * 0.7) : 1;
        const radius = (s.isRecent ? 8.8 : 6.2) * betaPulse;
        drawStar(p.x, p.y, radius, tintForCategory(s.feature.category), s.isRecent, s.isBeta, betaPulse);
      });

      ctx.globalCompositeOperation = "source-over";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(245,240,232,0.55)";
      anchors.forEach((anchor, name) => {
        const p = project(anchor.clone().add(new THREE.Vector3(0, 3.1, 0)), rot, w, h);
        if (!p || p.x < -120 || p.x > w + 120 || p.y < -40 || p.y > h + 40) return;
        ctx.fillText(name.toUpperCase(), p.x, p.y);
      });

      frame = requestAnimationFrame(draw);
    };

    sizeCanvas();
    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(parent);
    frame = requestAnimationFrame(draw);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [stars, anchors, reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
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

// ---------- Renderer size sync ----------
// R3F's built-in ResizeObserver hook can read 0×0 during the production
// SSR hydration path — the Canvas mounts before layout resolves and never
// re-measures, so the underlying <canvas> stays at the WebGL default
// (300×150). We force a measurement pass from the wrapper element on
// mount and observe it for the lifetime of the scene.
function ResizeSync({ wrapperRef }: { wrapperRef: React.RefObject<HTMLDivElement | null> }) {
  const { gl, camera, setSize } = useThree();
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const apply = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      setSize(w, h);
      gl.setSize(w, h, false);
      if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
        const cam = camera as THREE.PerspectiveCamera;
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
      }
      // Force the DOM canvas to fill its wrapper — belt-and-suspenders
      // against any stale inline attributes from a prior 0×0 measurement.
      const cnv = gl.domElement;
      gl.toneMapping = THREE.NoToneMapping;
      cnv.style.width = "100%";
      cnv.style.height = "100%";
      cnv.style.display = "block";
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [gl, camera, setSize, wrapperRef]);
  return null;
}



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
  // Star-dive state: the moment a star is chosen we render a fullscreen
  // gold overlay that blooms open (radial reveal + gentle scale) while
  // routing kicks off underneath. Reverse-navigation from the detail
  // page reuses the View Transitions API (already wired site-wide).
  const [diving, setDiving] = useState<StarData | null>(null);
  // Chrome auto-fade — 3s pointer-idle in this view drops opacity of the
  // legend/back/hint layers so the sky is the only thing on stage.
  const [chromeIdle, setChromeIdle] = useState(false);

  // Client-mount gate. Prevents R3F Canvas from mounting during hydration
  // (when the wrapper may still measure 0×0 in the production build) and
  // guards against a duplicate stale 300×150 canvas from a pre-layout mount.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Two rAFs: first commits layout, second guarantees the wrapper has
    // real bounds before Canvas mounts and R3F reads its size.
    let alive = true;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (alive) setReady(true);
      });
    });
    const fallback = window.setTimeout(() => {
      if (alive) setReady(true);
    }, 180);
    return () => {
      alive = false;
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);




  // Advertise the current view to the shell so Oracle + other chrome can
  // opt into the same idle-fade behavior.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.dataset.view = "constellation";
    return () => {
      if (document.body.dataset.view === "constellation") {
        delete document.body.dataset.view;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let t: ReturnType<typeof setTimeout> | null = null;
    const kick = () => {
      setChromeIdle(false);
      if (t) clearTimeout(t);
      t = setTimeout(() => setChromeIdle(true), 3000);
    };
    kick();
    window.addEventListener("pointermove", kick, { passive: true });
    window.addEventListener("pointerdown", kick, { passive: true });
    window.addEventListener("keydown", kick);
    return () => {
      window.removeEventListener("pointermove", kick);
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      if (t) clearTimeout(t);
    };
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

  // -------- Star dive --------
  // The atlas is one continuous space: clicking a star doesn't feel like a
  // page change, it feels like flying into that star. We paint an overlay
  // that blooms outward in the star's category tint (radial reveal + gentle
  // camera-forward parallax), then hand off to the router. The detail page
  // uses View Transitions for the visual settle. Reverse navigation
  // (backwards) reverses the same transition automatically.
  const goToStar = (s: StarData) => {
    const nav = () =>
      navigate({ to: "/features/$slug", params: { slug: s.feature.id } });
    if (reduceMotion) {
      nav();
      return;
    }
    setDiving(s);
    // 620ms of cinematic breath before route handoff; the overlay stays on
    // top during the transition so the detail page reveals *behind* the
    // gold bloom rather than replacing the sky abruptly.
    window.setTimeout(() => {
      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        (document as unknown as {
          startViewTransition: (cb: () => void) => void;
        }).startViewTransition(nav);
      } else {
        nav();
      }
    }, 620);
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
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-ink"
      data-chrome-idle={chromeIdle ? "true" : "false"}
      style={
        {
          // Any child chrome that opts into idle-fade reads this variable.
          // Kept as a var so we can tune the "quiet" opacity in one place.
          "--chrome-opacity": chromeIdle && !diving ? "0.12" : "1",
          "--chrome-transition": "opacity 700ms cubic-bezier(0.22,1,0.36,1)",
        } as React.CSSProperties
      }
    >
      <div ref={canvasWrapRef} className="absolute inset-0" style={gyroWrapStyle}>
        <SkyRasterOverlay stars={stars} anchors={anchors} reduce={reduceMotion} />
        {ready && (
        <Canvas
          key="constellation-canvas"
          camera={{ position: [0, 3, 34], fov: 55 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false, toneMapping: THREE.NoToneMapping }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NoToneMapping;
            gl.domElement.style.width = "100%";
            gl.domElement.style.height = "100%";
            gl.domElement.style.display = "block";
          }}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background:
              "radial-gradient(circle at 50% 55%, #0d2118 0%, #0A0A0A 65%)",
          }}
        >
          <ResizeSync wrapperRef={canvasWrapRef} />

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
        )}
      </div>


      {/* Stardust cursor overlay — desktop pointer only */}
      <StardustCursor disabled={isTouch} />

      {/* Intro overline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-6 flex justify-center px-6 sm:top-10"
        style={{ opacity: "var(--chrome-opacity)", transition: "var(--chrome-transition)" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cream/55 sm:text-[11px]">
          The atlas, as a sky — every feature a star.
        </p>
      </div>

      {/* Back link */}
      <div
        className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8"
        style={{ opacity: "var(--chrome-opacity)", transition: "var(--chrome-transition)" }}
      >
        <Link
          to="/"
          className="font-mono text-[11px] uppercase tracking-[0.28em] text-cream/65 transition-colors hover:text-gold"
        >
          ← Back to grid
        </Link>
      </div>

      {/* Legend + sound toggle */}
      <div
        className="absolute bottom-5 left-5 z-10 space-y-2 rounded-md border border-cream/10 bg-ink/70 p-4 backdrop-blur-sm sm:bottom-8 sm:left-8"
        style={{ opacity: "var(--chrome-opacity)", transition: "var(--chrome-transition)" }}
      >
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
      <div
        className="pointer-events-none absolute bottom-5 right-5 z-10 hidden max-w-[220px] text-right font-mono text-[10px] uppercase tracking-[0.24em] text-cream/40 sm:block sm:bottom-8 sm:right-8"
        style={{ opacity: "var(--chrome-opacity)", transition: "var(--chrome-transition)" }}
      >
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

      {/* Star dive overlay — a gold bloom that flies outward from the
          selected star's screen position while the router transitions to
          the detail page. Category tint colors the corona. */}
      <AnimatePresence>
        {diving && (
          <motion.div
            key={`dive-${diving.feature.id}`}
            initial={{ opacity: 0, scale: 0.02 }}
            animate={{ opacity: 1, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.62, ease: [0.7, 0, 0.2, 1] }}
            className="pointer-events-none absolute inset-0 z-[70]"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${tintForCategory(diving.feature.category)} 0%, rgba(201,169,97,0.55) 26%, rgba(10,10,10,0.85) 62%, rgba(10,10,10,1) 100%)`,
              mixBlendMode: "screen",
              transformOrigin: "50% 50%",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

