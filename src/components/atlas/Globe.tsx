import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { features } from "../../data/features";

const CATEGORIES = Array.from(new Set(features.map((f) => f.category))).slice(0, 16);

function makeHeartShape(scale = 0.05): THREE.Shape {
  const toX = (x: number) => (x - 32) * scale;
  const toY = (y: number) => -(y - 32) * scale;
  const shape = new THREE.Shape();
  shape.moveTo(toX(32), toY(54));
  shape.lineTo(toX(11), toY(33));
  shape.bezierCurveTo(toX(5), toY(27), toX(5), toY(18), toX(11), toY(12));
  shape.bezierCurveTo(toX(17), toY(6), toX(26), toY(6), toX(32), toY(12));
  shape.bezierCurveTo(toX(38), toY(6), toX(47), toY(6), toX(53), toY(12));
  shape.bezierCurveTo(toX(59), toY(18), toX(59), toY(27), toX(53), toY(33));
  shape.lineTo(toX(32), toY(54));
  return shape;
}

function Heart() {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const shape = makeHeartShape(0.032);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSegments: 6,
      bevelSize: 0.04,
      bevelThickness: 0.05,
      curveSegments: 32,
    });
    geom.center();
    return geom;
  }, []);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0015;
  });

  return (
    <mesh ref={ref} geometry={geometry} rotation={[-0.18, 0, 0]}>
      <meshStandardMaterial
        color="#FF5C9A"
        metalness={0.85}
        roughness={0.22}
        emissive="#9B5DE5"
        emissiveIntensity={0.45}
      />
    </mesh>
  );
}

function CategoryLabels() {
  const radius = 3.4;
  return (
    <group>
      {CATEGORIES.map((cat, i) => {
        const angle = (i / CATEGORIES.length) * Math.PI * 2;
        const latIndex = i % 4;
        const phi = (latIndex - 1.5) * 0.55;
        const x = radius * Math.cos(angle) * Math.cos(phi);
        const y = radius * Math.sin(phi) * 1.1;
        const z = radius * Math.sin(angle) * Math.cos(phi);
        return (
          <Html
            key={cat}
            position={[x, y, z]}
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
        color="#E94BCB"
        size={0.03}
        sizeAttenuation
        opacity={0.45}
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
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[-3, 4, 3]} intensity={1.1} color="#FF5C9A" />
        <directionalLight position={[3, -3, 2]} intensity={0.7} color="#9B5DE5" />
        <Heart />
        <CategoryLabels />
        <Dust />
      </Canvas>
    </Suspense>
  );
}
