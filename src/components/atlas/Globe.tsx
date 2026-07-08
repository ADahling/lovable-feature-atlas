import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { features } from "../../data/features";

// Silence the internal THREE.Clock deprecation warning (r184+).
if (typeof window !== "undefined") {
  const w = window as unknown as { __atlasClockWarnPatched?: boolean };
  if (!w.__atlasClockWarnPatched) {
    w.__atlasClockWarnPatched = true;
    const originalWarn = console.warn.bind(console);
    console.warn = (...args: unknown[]) => {
      const first = args[0];
      if (typeof first === "string" && first.includes("THREE.Clock")) return;
      originalWarn(...args);
    };
  }
}

const CATEGORIES = Array.from(new Set(features.map((f) => f.category))).slice(0, 16);

function makeHeartShape(scale = 0.05): THREE.Shape {
  const toX = (x: number) => (x - 32) * scale;
  const toY = (y: number) => -(y - 32) * scale;
  const shape = new THREE.Shape();
  shape.moveTo(toX(32), toY(58));
  shape.bezierCurveTo(toX(20), toY(48), toX(2), toY(38), toX(2), toY(22));
  shape.bezierCurveTo(toX(2), toY(8), toX(20), toY(2), toX(32), toY(18));
  shape.bezierCurveTo(toX(44), toY(2), toX(62), toY(8), toX(62), toY(22));
  shape.bezierCurveTo(toX(62), toY(38), toX(44), toY(48), toX(32), toY(58));
  return shape;
}

function SceneEnvironment() {
  const { scene, gl } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const rt = pmrem.fromScene(roomEnv, 0.04);
    const prev = scene.environment;
    scene.environment = rt.texture;
    return () => {
      scene.environment = prev;
      rt.dispose();
      pmrem.dispose();
    };
  }, [scene, gl]);
  return null;
}

function Heart({ theme }: { theme: "dark" | "light" }) {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const tiltRef = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => {
    const shape = makeHeartShape(0.032);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.34,
      bevelEnabled: true,
      bevelSegments: 8,
      bevelSize: 0.05,
      bevelThickness: 0.06,
      curveSegments: 48,
    });
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }, []);

  const material = useMemo(() => {
    const isLight = theme === "light";
    const mat = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#0B3D2E" : "#1F7A5A",
      metalness: isLight ? 0.2 : 0.72,
      roughness: isLight ? 0.42 : 0.28,
      clearcoat: isLight ? 0.55 : 0.85,
      clearcoatRoughness: 0.22,
      emissive: "#0B3D2E",
      emissiveIntensity: isLight ? 0.05 : 0.28,
      envMapIntensity: isLight ? 0.6 : 1.1,
    });


    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uRimColor = {
        value: new THREE.Color(isLight ? "#8E7434" : "#C9A961"),
      };
      shader.uniforms.uRimPower = { value: 2.4 };
      shader.uniforms.uRimIntensity = { value: isLight ? 1.1 : 1.55 };
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "void main() {",
          `uniform vec3 uRimColor;
           uniform float uRimPower;
           uniform float uRimIntensity;
           void main() {`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
           vec3 vN = normalize(vNormal);
           vec3 vV = normalize(vViewPosition);
           float rim = pow(1.0 - max(dot(vN, vV), 0.0), uRimPower);
           totalEmissiveRadiance += uRimColor * rim * uRimIntensity;`,
        );
    };

    return mat;
  }, [theme]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    timeRef.current += delta;
    const t = timeRef.current;
    // 6s float loop, sine ease
    const floatY = Math.sin((t * Math.PI * 2) / 6) * 0.11;
    const idleRot = t * 0.14;

    // Mouse parallax — clamp 8° = ~0.1396 rad, lerp 0.08
    const maxRot = 0.1396;
    const targetX = -state.pointer.y * maxRot;
    const targetY = state.pointer.x * maxRot;
    tiltRef.current.x += (targetX - tiltRef.current.x) * 0.08;
    tiltRef.current.y += (targetY - tiltRef.current.y) * 0.08;

    ref.current.position.y = floatY;
    ref.current.rotation.x = -0.18 + tiltRef.current.x;
    ref.current.rotation.y = idleRot + tiltRef.current.y;
  });

  return <mesh ref={ref} geometry={geometry} material={material} />;
}

function CategoryLabels({ theme }: { theme: "dark" | "light" }) {
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
                color: theme === "light" ? "#0A0A0A" : "#FBF5E9",
                opacity: theme === "light" ? 0.42 : 0.55,
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

function Dust({ theme }: { theme: "dark" | "light" }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(700 * 3);
    for (let i = 0; i < 700; i++) {
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
        color={theme === "light" ? "#8E7434" : "#C9A961"}
        size={0.03}
        sizeAttenuation
        opacity={theme === "light" ? 0.35 : 0.42}
        depthWrite={false}
      />
    </Points>
  );
}

export default function Globe({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const isLight = theme === "light";
  return (
    <Suspense fallback={<div className="size-full" />}>
      <Canvas
        dpr={[1, 1.5]}
        shadows={false}
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneEnvironment />
        <ambientLight intensity={isLight ? 0.55 : 0.32} />
        <directionalLight
          position={[-3, 4, 3]}
          intensity={isLight ? 1.35 : 1.05}
          color={isLight ? "#F4D48A" : "#C9A961"}
        />
        <directionalLight
          position={[3, -3, 2]}
          intensity={isLight ? 0.55 : 0.75}
          color={isLight ? "#B49156" : "#2EA579"}
        />
        <pointLight
          position={[0, 0, 4]}
          intensity={isLight ? 0.4 : 0.6}
          color={isLight ? "#FBF5E9" : "#2EA579"}
          distance={10}
        />
        <Heart theme={theme} />
        <CategoryLabels theme={theme} />
        <Dust theme={theme} />
      </Canvas>
    </Suspense>
  );
}
