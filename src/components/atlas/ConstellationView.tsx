import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX, X, ArrowRight } from "lucide-react";
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
import { iconForCategory } from "../../lib/category-icons";

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
const JITTER = 2.6;
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

// Entry-choreography timings (ms from entryStartMs).
//  0 → LABEL_STAGGER * catCount ........ category labels ignite clockwise
//  LABEL_DONE → STAR_STAGGER × maxDist .. stars ignite center-outward per category
//  STAR_DONE → +FILAMENT_FADE ........... faint filaments draw between siblings
const LABEL_STAGGER_MS = 120;
const STAR_BASE_DELAY_MS = 40; // baseline per-ring gap
const STAR_JITTER_MS = 40;     // 40-80ms seeded variation
const FILAMENT_FADE_MS = 500;

interface Filament {
  aIdx: number; // star index
  bIdx: number;
  category: string;
}

function buildFilaments(stars: StarData[]): Filament[] {
  // Group stars by category, then connect each star to its single nearest
  // sibling in the same cluster. Dedupe edges (a-b == b-a).
  const byCat = new Map<string, number[]>();
  stars.forEach((s, i) => {
    const arr = byCat.get(s.feature.category);
    if (arr) arr.push(i);
    else byCat.set(s.feature.category, [i]);
  });
  const seen = new Set<string>();
  const edges: Filament[] = [];
  byCat.forEach((idxs, cat) => {
    if (idxs.length < 2) return;
    idxs.forEach((i) => {
      let bestJ = -1;
      let bestD = Infinity;
      idxs.forEach((j) => {
        if (j === i) return;
        const d = stars[i].position.distanceToSquared(stars[j].position);
        if (d < bestD) {
          bestD = d;
          bestJ = j;
        }
      });
      if (bestJ === -1) return;
      const key = i < bestJ ? `${i}-${bestJ}` : `${bestJ}-${i}`;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ aIdx: i, bIdx: bestJ, category: cat });
    });
  });
  return edges;
}

function SkyRasterOverlay({
  stars,
  anchors,
  reduce,
  entryStartMs,
  selectedId,
}: {
  stars: StarData[];
  anchors: Map<string, THREE.Vector3>;
  reduce: boolean;
  entryStartMs: number | null;
  selectedId: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Precompute:
  //  - clockwise category order (by initial screen angle around center)
  //  - per-star ignition delay (based on distance from cluster anchor + jitter)
  //  - filament edges
  const { categoryOrder, starDelay, filaments } = useMemo(() => {
    const rand = mulberry32(hashId(stars.map((s) => s.feature.id).join("|") || "empty"));

    // Project each anchor at rotation=0 to a rough screen angle around
    // (0, cameraY). We only need relative angles so we skip perspective.
    const catAngles: Array<{ name: string; angle: number }> = [];
    anchors.forEach((pos, name) => {
      // Screen mapping: x → right, y → up (invert to clockwise from 12 o'clock)
      const angle = Math.atan2(pos.x, pos.y + 1e-6);
      catAngles.push({ name, angle });
    });
    // Clockwise from top-of-screen: sort by angle ascending, angle from -π..π
    catAngles.sort((a, b) => a.angle - b.angle);
    const order = catAngles.map((c) => c.name);
    const orderIndex = new Map<string, number>();
    order.forEach((n, i) => orderIndex.set(n, i));

    // Per-category max distance for normalization.
    const maxDistByCat = new Map<string, number>();
    stars.forEach((s) => {
      const anchor = anchors.get(s.feature.category);
      if (!anchor) return;
      const d = s.position.distanceTo(anchor);
      const cur = maxDistByCat.get(s.feature.category) ?? 0;
      if (d > cur) maxDistByCat.set(s.feature.category, d);
    });

    const delay = stars.map((s) => {
      const catI = orderIndex.get(s.feature.category) ?? 0;
      const anchor = anchors.get(s.feature.category);
      const d = anchor ? s.position.distanceTo(anchor) : 0;
      const dMax = maxDistByCat.get(s.feature.category) ?? 1;
      const norm = d / (dMax || 1); // 0 = center, 1 = edge
      const catStart = catI * LABEL_STAGGER_MS;
      const outward = norm * (STAR_BASE_DELAY_MS * 8); // ~0..320ms per ring
      const jitter = STAR_BASE_DELAY_MS + rand() * STAR_JITTER_MS; // 40-80
      return catStart + outward + jitter;
    });

    const fils = buildFilaments(stars);
    return { categoryOrder: order, starDelay: delay, filaments: fils };
  }, [stars, anchors]);

  // Timings derived from data.
  const labelDoneMs = categoryOrder.length * LABEL_STAGGER_MS;
  const starDoneMs = Math.max(
    labelDoneMs,
    ...starDelay,
    0,
  );
  const filamentEndMs = starDoneMs + FILAMENT_FADE_MS;
  // Total entry window used to skip work after settle.
  const _totalEntryMs = filamentEndMs;

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

    // Smoothed screen-space offset applied to every projected point so the
    // selected star drifts toward the right third of the viewport.
    let offX = 0;
    let offY = 0;

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
      alphaMul: number,
      selected: boolean,
    ) => {
      const inner = recent ? cream : gold;
      const haloR = radius * (selected ? 2.6 : 2.0);
      const halo = ctx.createRadialGradient(x, y, 0, x, y, haloR);
      halo.addColorStop(0, `rgba(${inner.r},${inner.g},${inner.b},${1 * pulse * alphaMul})`);
      halo.addColorStop(0.24, `rgba(${cream.r},${cream.g},${cream.b},${0.72 * pulse * alphaMul})`);
      halo.addColorStop(0.6, `${tint}${recent ? "BB" : beta ? "99" : "77"}`);
      halo.addColorStop(1, "rgba(10,10,10,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, haloR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${cream.r},${cream.g},${cream.b},${(recent ? 1 : 0.95) * alphaMul})`;
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.05, 0, Math.PI * 2);
      ctx.fill();

      if (selected) {
        // Gold selection ring — two-stroke to read on any tint.
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = `rgba(10,10,10,${0.55 * alphaMul})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${gold.r},${gold.g},${gold.b},${0.95 * alphaMul})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2.15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalCompositeOperation = "lighter";
      }
    };

    // Smoothed framing scale about a pivot in screen space. When a star
    // is selected we glide the whole cluster to the visible-canvas center
    // (viewport minus the 400px drawer on the right) at ~1.35× scale;
    // when nothing is selected these ease back to identity.
    let sc = 1;
    let pivotX = 0;
    let pivotY = 0;
    let targetX = 0;
    let targetY = 0;

    const draw = (time: number) => {
      if (disposed) return;
      const { w, h } = sizeCanvas();
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const rot = reduce ? 0 : time * 0.000035;

      // Entry progress: elapsed ms since entryStartMs (or Infinity if we're
      // past entry / reduced-motion — everything shows at full intensity).
      const elapsed = entryStartMs == null || reduce ? Infinity : performance.now() - entryStartMs;

      // ---------- Framing: recenter + zoom the selected cluster ----------
      const selectedStar = selectedId
        ? stars.find((s) => s.feature.id === selectedId) ?? null
        : null;
      const selectedCat = selectedStar?.feature.category ?? null;

      // Drawer occupies 400px on the right (or 92vw on narrow phones).
      const drawerW = selectedId ? Math.min(400, w * 0.92) : 0;
      const visibleW = w - drawerW;

      let desiredScale = 1;
      let desiredPivotX = w / 2;
      let desiredPivotY = h / 2;
      let desiredTargetX = w / 2;
      let desiredTargetY = h / 2;

      if (selectedStar && selectedCat) {
        // Project the cluster centroid (mean of same-category star positions
        // *and* the anchor + selected star, so the pivot sits inside the
        // visible constellation, not off in the anchor abstraction).
        const catStars = stars.filter((s) => s.feature.category === selectedCat);
        let sx = 0;
        let sy = 0;
        let n = 0;
        catStars.forEach((s) => {
          const q = project(s.position, rot, w, h);
          if (!q) return;
          sx += q.x;
          sy += q.y;
          n += 1;
        });
        if (n > 0) {
          desiredPivotX = sx / n;
          desiredPivotY = sy / n;
          desiredScale = 1.35;
          // Center of the visible (non-drawer) canvas area.
          desiredTargetX = drawerW > 0 ? visibleW / 2 : w / 2;
          // Nudge slightly above center so the composed category label
          // above the cluster stays inside the frame.
          desiredTargetY = h / 2 + 24;
        }
      }
      // If nothing selected on the very first frame, seed pivots to center
      // so the identity transform is a no-op.
      if (sc === 1 && pivotX === 0 && pivotY === 0) {
        pivotX = desiredPivotX;
        pivotY = desiredPivotY;
        targetX = desiredTargetX;
        targetY = desiredTargetY;
      }
      const k = 0.09;
      sc      += (desiredScale   - sc)      * k;
      pivotX  += (desiredPivotX  - pivotX)  * k;
      pivotY  += (desiredPivotY  - pivotY)  * k;
      targetX += (desiredTargetX - targetX) * k;
      targetY += (desiredTargetY - targetY) * k;

      const xf = (p: { x: number; y: number }) => ({
        x: (p.x - pivotX) * sc + targetX,
        y: (p.y - pivotY) * sc + targetY,
      });

      // Project all stars once (raw), transform per-draw below.
      const projected: Array<{ x: number; y: number; depth: number } | null> = stars.map((s) =>
        project(s.position, rot, w, h),
      );

      // 1) Filaments (drawn first so stars sit on top).
      const filamentAlpha = (() => {
        if (elapsed === Infinity) return 0.28;
        if (elapsed <= starDoneMs) return 0;
        const t = Math.min(1, (elapsed - starDoneMs) / FILAMENT_FADE_MS);
        return 0.28 * t;
      })();
      if (filamentAlpha > 0.005) {
        ctx.globalCompositeOperation = "source-over";
        filaments.forEach((f) => {
          const a = projected[f.aIdx];
          const b = projected[f.bIdx];
          if (!a || !b) return;
          const isFocusCat = !selectedCat || selectedCat === f.category;
          const alpha = filamentAlpha * (isFocusCat ? (selectedCat ? 1.5 : 1) : 0.18);
          const tint = tintForCategory(f.category);
          ctx.strokeStyle = `${tint}${Math.round(Math.min(1, alpha) * 255)
            .toString(16)
            .padStart(2, "0")}`;
          ctx.lineWidth = isFocusCat && selectedCat ? 1.0 : 0.6;
          const ta = xf(a);
          const tb = xf(b);
          ctx.beginPath();
          ctx.moveTo(ta.x, ta.y);
          ctx.lineTo(tb.x, tb.y);
          ctx.stroke();
        });
        ctx.globalCompositeOperation = "lighter";
      }

      // 2) Stars.
      stars.forEach((s, i) => {
        const p = projected[i];
        if (!p) return;
        const t2 = xf(p);
        const sx2 = t2.x;
        const sy2 = t2.y;
        if (sx2 < -60 || sx2 > w + 60 || sy2 < -60 || sy2 > h + 60) return;

        // Entry gate.
        let entryAlpha = 1;
        if (elapsed !== Infinity) {
          const d = starDelay[i];
          if (elapsed < d) return;
          entryAlpha = Math.min(1, (elapsed - d) / 220);
        }

        // Selection composition: selected = brightest, siblings = 0.85,
        // unrelated = 0.25. When nothing selected everything is full.
        let selectionAlpha = 1;
        const isSelected = selectedId === s.feature.id;
        if (selectedId) {
          if (isSelected) selectionAlpha = 1;
          else if (s.feature.category === selectedCat) selectionAlpha = 0.85;
          else selectionAlpha = 0.25;
        }

        const alphaMul = entryAlpha * selectionAlpha;
        const betaPulse = s.isBeta && !reduce ? 1 + 0.18 * Math.sin(time * 0.002 + i * 0.7) : 1;
        // Scale radius modestly with framing zoom so the cluster reads bigger.
        const zoomFactor = 1 + (sc - 1) * 0.6;
        const radius = (s.isRecent ? 8.8 : 6.2) * betaPulse * (isSelected ? 1.25 : 1) * zoomFactor;
        drawStar(
          sx2,
          sy2,
          radius,
          tintForCategory(s.feature.category),
          s.isRecent,
          s.isBeta,
          betaPulse,
          alphaMul,
          isSelected,
        );
      });

      // 3) Labels — ignited clockwise, then anti-collision + soft halo.
      ctx.globalCompositeOperation = "source-over";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      type Placed = { x: number; y: number; name: string; alpha: number; big: boolean };
      const placed: Placed[] = [];
      categoryOrder.forEach((name, ci) => {
        const anchor = anchors.get(name);
        if (!anchor) return;
        const isFocus = selectedCat === name;
        // For the focused category we compose the label above the cluster
        // centroid (in transformed space) rather than the anchor, so it
        // stays visually attached to the reframed constellation.
        let px: number;
        let py: number;
        if (isFocus) {
          const catStars = stars.filter((s) => s.feature.category === name);
          let cx = 0;
          let cy = 0;
          let minY = Infinity;
          let n = 0;
          catStars.forEach((s) => {
            const q = project(s.position, rot, w, h);
            if (!q) return;
            const t2 = xf(q);
            cx += t2.x;
            cy += t2.y;
            if (t2.y < minY) minY = t2.y;
            n += 1;
          });
          if (n === 0) return;
          px = cx / n;
          py = Math.min(cy / n - 90, minY - 32);
        } else {
          const p = project(anchor.clone().add(new THREE.Vector3(0, 3.4, 0)), rot, w, h);
          if (!p) return;
          const t2 = xf(p);
          px = t2.x;
          py = t2.y;
        }
        if (px < -140 || px > w + 140 || py < -40 || py > h + 40) return;
        // Label ignition.
        let alpha = 1;
        if (elapsed !== Infinity) {
          const start = ci * LABEL_STAGGER_MS;
          if (elapsed < start) return;
          alpha = Math.min(1, (elapsed - start) / 260);
        }
        // Selection dim on non-focus labels.
        if (selectedCat && !isFocus) alpha *= 0.28;
        let y = py;
        for (let attempt = 0; attempt < 6; attempt++) {
          const collision = placed.some(
            (q) => Math.abs(q.x - px) < 110 && Math.abs(q.y - y) < 18,
          );
          if (!collision) break;
          y -= 18;
        }
        placed.push({ x: px, y, name, alpha, big: isFocus });
      });
      // Backgrounds
      placed.forEach((q) => {
        ctx.font = q.big
          ? "600 13px 'JetBrains Mono', monospace"
          : "600 11px 'JetBrains Mono', monospace";
        const w2 = ctx.measureText(q.name.toUpperCase()).width;
        const padY = q.big ? 11 : 9;
        const padX = q.big ? 10 : 7;
        ctx.fillStyle = `rgba(10,10,10,${(q.big ? 0.82 : 0.7) * q.alpha})`;
        ctx.fillRect(q.x - w2 / 2 - padX, q.y - padY, w2 + padX * 2, padY * 2);
        if (q.big) {
          // Hairline gold underline for the focused label.
          ctx.strokeStyle = `rgba(201,169,97,${0.55 * q.alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(q.x - w2 / 2 - padX, q.y + padY);
          ctx.lineTo(q.x + w2 / 2 + padX, q.y + padY);
          ctx.stroke();
        }
      });
      // Foreground text
      placed.forEach((q) => {
        ctx.font = q.big
          ? "600 13px 'JetBrains Mono', monospace"
          : "600 11px 'JetBrains Mono', monospace";
        const color = q.big ? `rgba(201,169,97,${0.98 * q.alpha})` : `rgba(245,240,232,${0.92 * q.alpha})`;
        ctx.fillStyle = color;
        ctx.fillText(q.name.toUpperCase(), q.x, q.y);
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
  }, [
    stars,
    anchors,
    reduce,
    entryStartMs,
    selectedId,
    categoryOrder,
    starDelay,
    filaments,
    labelDoneMs,
    starDoneMs,
    filamentEndMs,
  ]);

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
          <span data-constellation-label className="constellation-label whitespace-nowrap text-cream/85">
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
  // In-context preview: clicking a star selects it (no navigation). The
  // sky dims non-selected stars to 30%, drifts the selection toward the
  // right third, and opens a 400px right-hand drawer. Only the drawer's
  // "Open full record" link routes to the detail page.
  const [selected, setSelected] = useState<StarData | null>(null);
  // Entry-choreography start timestamp (ms). Reset whenever stars change.
  const [entryStartMs, setEntryStartMs] = useState<number | null>(null);
  useEffect(() => {
    if (stars.length === 0) return;
    setEntryStartMs(reduceMotion ? null : performance.now());
  }, [stars, reduceMotion]);
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
    // Star click NEVER navigates. It opens the in-context preview drawer
    // and eases the sky to focus on the pick. The only navigator is
    // the drawer's "Open full record" link (goToStar below).
    setSelected(s);
    setHover(null);
    pendingTap.current = null;
    if (tapTimer.current) window.clearTimeout(tapTimer.current);
  };

  const clearSelection = useCallback(() => setSelected(null), []);

  // Escape closes the drawer.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, clearSelection]);

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
      className="relative h-[100dvh] w-full overflow-hidden"
      data-chrome-idle={chromeIdle ? "true" : "false"}
      style={
        {
          // The sky is a PLACE — always the dark night-sky palette regardless
          // of site theme. We override --ink / --cream locally so every
          // descendant token (bg-ink, text-cream, border-cream/…) resolves to
          // the dark palette; only the site nav (rendered outside this tree)
          // follows the active theme.
          "--ink": "#0A0A0A",
          "--cream": "#FBF5E9",
          backgroundColor: "#0A0A0A",
          color: "#FBF5E9",
          "--chrome-opacity": chromeIdle && !diving ? "0.12" : "1",
          "--chrome-transition": "opacity 700ms cubic-bezier(0.22,1,0.36,1)",
        } as React.CSSProperties
      }
    >
      <div ref={canvasWrapRef} className="absolute inset-0" style={gyroWrapStyle}>
        <SkyRasterOverlay stars={stars} anchors={anchors} reduce={reduceMotion} entryStartMs={entryStartMs} selectedId={selected?.feature.id ?? null} />
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
          {/* Category labels are drawn by SkyRasterOverlay with overlap
              avoidance; removed from the 3D scene to prevent double-render. */}
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
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cream/75">
          Legend
        </p>
        <div className="flex items-center gap-2 font-mono text-[12px] text-cream/90">
          <span className="inline-block h-2 w-2 rounded-full bg-[#C9A961]" aria-hidden />
          GA — steady
        </div>
        <div className="flex items-center gap-2 font-mono text-[12px] text-cream/90">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald" aria-hidden />
          Beta — pulsing
        </div>
        <div className="flex items-center gap-2 font-mono text-[12px] text-cream/90">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_10px_rgba(201,169,97,0.9)]" aria-hidden />
          Shipped in last 30 days — brighter
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            className="inline-flex items-center gap-2 rounded border border-cream/25 px-3 py-2 font-mono text-[12px] uppercase tracking-[0.18em] text-cream/90 transition-colors hover:border-gold/70 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
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
              className="inline-flex items-center gap-2 rounded border border-cream/25 px-3 py-2 font-mono text-[12px] uppercase tracking-[0.18em] text-cream/90 transition-colors hover:border-gold/70 hover:text-gold"
            >
              Enable tilt parallax
            </button>
          </div>
        )}
      </div>

      {/* Hint */}
      <div
        className="pointer-events-none absolute bottom-5 right-5 z-10 hidden max-w-[260px] rounded-md border border-cream/15 bg-ink/70 px-3 py-2 text-right font-mono text-[11px] uppercase tracking-[0.2em] text-cream/80 backdrop-blur-sm sm:block sm:bottom-8 sm:right-8"
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

      {/* Tooltip — hidden while the drawer is open */}
      {hover && !selected && (
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
        </div>
      )}

      {/* In-context preview drawer — 400px, fixed to the right. Only the
          "Open full record" link navigates; Escape / backdrop / close
          restore the full sky. */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.button
              key="drawer-backdrop"
              type="button"
              aria-label="Close preview"
              onClick={clearSelection}
              className="absolute inset-0 z-[55] cursor-default bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.aside
              key={`drawer-${selected.feature.id}`}
              role="dialog"
              aria-modal="false"
              aria-label={`${selected.feature.name} preview`}
              className="absolute right-0 top-0 z-[60] flex h-full w-[400px] max-w-[92vw] flex-col border-l border-cream/10 bg-ink/92 p-8 backdrop-blur-md"
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                  style={{
                    borderColor: tintForCategory(selected.feature.category) + "80",
                    color: tintForCategory(selected.feature.category),
                  }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: tintForCategory(selected.feature.category) }}
                  />
                  {selected.feature.category} · {selected.feature.status}
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  aria-label="Close preview"
                  className="rounded-md border border-cream/15 p-1.5 text-cream/60 transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>

              <h2 className="mb-3 font-display text-[26px] leading-[1.1] tracking-[-0.02em] text-cream">
                {selected.feature.name}
              </h2>

              {selected.feature.tagline && (
                <p className="mb-6 text-[15px] leading-[1.45] text-cream/75">
                  {selected.feature.tagline}
                </p>
              )}

              {selected.feature.releaseDate && (
                <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-cream/50">
                  Released ·{" "}
                  {new Date(selected.feature.releaseDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}

              <div className="mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    const s = selected;
                    setSelected(null);
                    goToStar(s);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gold/60 bg-gold/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  Open full record
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Star dive overlay — fires only when "Open full record" is clicked. */}
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

