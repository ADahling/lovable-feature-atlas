import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";



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



import { buildHeartShape } from "../../lib/heart-path";

function makeHeartShape(scale = 0.05): THREE.Shape {
  return buildHeartShape(THREE, scale);
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
  const reducedMotion = useReducedMotion() ?? false;
  // Baseline emissive for glow-swell modulation.
  const baseEmissiveRef = useRef(0);


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
      color: isLight ? "#0E5A42" : "#1F7A5A",
      metalness: isLight ? 0.55 : 0.72,
      roughness: isLight ? 0.30 : 0.28,
      clearcoat: isLight ? 0.9 : 0.85,
      clearcoatRoughness: 0.22,
      emissive: isLight ? "#0B3D2E" : "#0B3D2E",
      emissiveIntensity: isLight ? 0.22 : 0.28,
      envMapIntensity: isLight ? 1.1 : 1.1,
    });


    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uRimColor = {
        value: new THREE.Color(isLight ? "#C9A961" : "#C9A961"),
      };
      shader.uniforms.uRimPower = { value: 2.4 };
      shader.uniforms.uRimIntensity = { value: isLight ? 1.7 : 1.55 };
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
    baseEmissiveRef.current = material.emissiveIntensity;
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

    // Idle heartbeat: a slow double-pulse (systole + softer diastole) once
    // per ~1.6s cycle. Amplitude ~1.8% scale so the heart quietly breathes
    // rather than throbs. Disabled entirely under prefers-reduced-motion.
    let beat = 0;
    if (!reducedMotion) {
      const period = 1.6;
      const phase = (t % period) / period;
      const g = (x: number, c: number, w: number) => {
        const d = (x - c) / w;
        return Math.exp(-d * d);
      };
      // Two Gaussian pulses per beat — quick systole, softer echo.
      beat = g(phase, 0.06, 0.055) + 0.55 * g(phase, 0.22, 0.075);
    }
    const scaleMul = 1 + 0.018 * beat;

    ref.current.position.y = floatY;
    ref.current.rotation.x = -0.18 + tiltRef.current.x;
    ref.current.rotation.y = idleRot + tiltRef.current.y;
    ref.current.scale.setScalar(scaleMul);
    // Sync a faint glow swell with the pulse.
    material.emissiveIntensity = baseEmissiveRef.current * (1 + 0.35 * beat);
  });

  return <mesh ref={ref} geometry={geometry} material={material} />;
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
        <Dust theme={theme} />

      </Canvas>
    </Suspense>
  );
}
