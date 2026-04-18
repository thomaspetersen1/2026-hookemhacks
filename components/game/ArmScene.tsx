"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ArmRig } from "./ArmRig";

export function ArmScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.8, 3.5], fov: 50, near: 0.1, far: 50 }}
      style={{ width: "100%", height: "100%", background: "#050810" }}
    >
      <fog attach="fog" args={["#050810", 8, 20]} />

      <Suspense fallback={null}>
        <ambientLight intensity={0.3} color="#6366f1" />
        <spotLight
          position={[4, 6, 4]}
          intensity={2.5}
          angle={0.7}
          penumbra={0.4}
          color="#fbbf24"
          castShadow
        />
        <spotLight
          position={[-4, 6, 4]}
          intensity={1.5}
          angle={0.7}
          penumbra={0.4}
          color="#38bdf8"
        />

        <ArmRig />

        {/* Subtle floor plane for shadow grounding */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#0b0f1a" roughness={0.6} metalness={0.2} />
        </mesh>
      </Suspense>
    </Canvas>
  );
}
