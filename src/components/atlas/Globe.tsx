import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { features } from "../../data/features";

const CATEGORIES = Array.from(new Set(features.map((f) => f.category))).slice(0, 16);

function Sphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0015;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.4, 64, 64]} />
      <meshStandardMaterial
        color="#FF2D87"
        metalness={0.7}
        roughness={0.3}
        emissive="#831843"
        emissiveIntensity={0.18}
      />
    </mesh>
  );
}

function CategoryLabels() {
  const radius = 2.2;
  return (
    <group>
      {CATEGORIES.map((cat, i) => {
        const angle = (i / CATEGORIES.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <Html
            key={cat}
            position={[x, 0, z]}
            center
            distanceFactor={6}
            style={{ pointerEvents: "none" }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono, ui-monospace, monospace",
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--cream)",
                opacity: 0.55,
                whiteSpace: "nowrap",
              }}
            >
              {cat}
            </span>
          </Html>
        );
      })}
    </group>
  );
}

function Dust() {
  const positions = useMemo(() => {
    const arr = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      // uniform distribution within a 6-unit-radius sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 6 * Math.cbrt(Math.random());
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  return (
    <Points positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#D946EF"
        size={0.03}
        sizeAttenuation
        opacity={0.5}
        depthWrite={false}
      />
    </Points>
  );
}

export default function Globe() {
  return (
    <Suspense fallback={<div className="size-full bg-ink" />}>
      <Canvas
        dpr={[1, 1.5]}
        shadows={false}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[-3, 4, 3]} intensity={1.2} />
        <directionalLight position={[3, -3, 2]} intensity={0.6} color="#FFCFE5" />
        <Sphere />
        <CategoryLabels />
        <Dust />
      </Canvas>
    </Suspense>
  );
}
