// ============================================================================
// stardust-cursor.tsx
// ---------------------------------------------------------------------------
// A pointer-following particle wake, rendered in a canvas overlay so the
// star field itself pays no per-frame React cost. Sparse gold + emerald
// motes, additive blend, sub-second despawn, capped total particle count.
// Skipped on touch devices and under prefers-reduced-motion.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number; // total lifespan in ms
  size: number;
  hue: 0 | 1; // 0 = gold, 1 = emerald
}

interface Props {
  disabled?: boolean;
}

const MAX_PARTICLES = 90;
const SPAWN_MIN_DIST = 6; // px between spawns along the pointer path

export function StardustCursor({ disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const dprRef = useRef(1);

  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      const last = lastSpawnRef.current;
      if (
        last &&
        Math.hypot(e.clientX - last.x, e.clientY - last.y) < SPAWN_MIN_DIST
      ) {
        return;
      }
      lastSpawnRef.current = { x: e.clientX, y: e.clientY };
      spawn(e.clientX, e.clientY);
    }

    function spawn(x: number, y: number) {
      const list = particlesRef.current;
      // Enforce cap by trimming oldest first.
      if (list.length >= MAX_PARTICLES) {
        list.splice(0, list.length - MAX_PARTICLES + 1);
      }
      // Spawn 1-2 motes per movement tick.
      const count = 1 + (Math.random() < 0.35 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 18; // px/sec (very slow drift)
        list.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 6, // slight upward bias
          born: performance.now(),
          life: 550 + Math.random() * 350,
          size: 1.2 + Math.random() * 1.6,
          hue: Math.random() < 0.7 ? 0 : 1,
        });
      }
    }

    function frame(now: number) {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      const list = particlesRef.current;
      const kept: Particle[] = [];
      for (const p of list) {
        const age = now - p.born;
        if (age >= p.life) continue;
        const t = age / p.life;
        const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        // integrate motion at 60 fps ref
        const dt = 1 / 60;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 6 * dt; // gentle downward drift after upward puff
        p.vx *= 0.985;
        const r = p.size;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        if (p.hue === 0) {
          grad.addColorStop(0, `rgba(232,207,142,${0.9 * alpha})`);
          grad.addColorStop(0.6, `rgba(201,169,97,${0.32 * alpha})`);
          grad.addColorStop(1, "rgba(201,169,97,0)");
        } else {
          grad.addColorStop(0, `rgba(120,220,180,${0.85 * alpha})`);
          grad.addColorStop(0.6, `rgba(31,122,90,${0.28 * alpha})`);
          grad.addColorStop(1, "rgba(31,122,90,0)");
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
        kept.push(p);
      }
      particlesRef.current = kept;
      rafRef.current = window.requestAnimationFrame(frame);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(frame);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [disabled]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5]"
    />
  );
}
