"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

// Wii Sports Resort-style dueling platform: raised wooden deck, torii gate,
// paper lanterns, water-like dark floor around the stage.

export function SwordArena() {
  return (
    <group>
      <WaterFloor />
      <Platform />
      <ToriiGate position={[0, 0, -6.5]} />
      <LanternPost position={[-2.6, 0, -2.6]} />
      <LanternPost position={[2.6, 0, -2.6]} />
      <LanternPost position={[-2.6, 0, 2.6]} />
      <LanternPost position={[2.6, 0, 2.6]} />
      <CenterEmblem />
    </group>
  );
}

function WaterFloor() {
  // Darker reflective-ish surface around the platform to sell the "floating stage" feel.
  const mesh = useRef<Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const m = mesh.current.material as { emissiveIntensity?: number };
    if (m.emissiveIntensity !== undefined) {
      m.emissiveIntensity = 0.05 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
    }
  });
  return (
    <mesh
      ref={mesh}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.005, -2]}
      receiveShadow
    >
      <planeGeometry args={[18, 16]} />
      <meshStandardMaterial
        color="#0a1220"
        emissive="#1e3a8a"
        emissiveIntensity={0.06}
        roughness={0.2}
        metalness={0.5}
      />
    </mesh>
  );
}

function Platform() {
  // Raised 5x5 wooden deck made of plank strips for a dojo look.
  const planks = useMemo(() => {
    const out: Array<{ x: number; color: string }> = [];
    const width = 5;
    const plankCount = 10;
    for (let i = 0; i < plankCount; i++) {
      const x = -width / 2 + (i + 0.5) * (width / plankCount);
      // alternate tone for visible grain
      const color = i % 2 === 0 ? "#92400e" : "#78350f";
      out.push({ x, color });
    }
    return out;
  }, []);

  return (
    <group position={[0, 0, -2]}>
      {/* platform base (thickness) */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[5.2, 0.2, 5.2]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      {/* plank top surface */}
      {planks.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, 0.205, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[5 / 10 - 0.02, 5]} />
          <meshStandardMaterial color={p.color} roughness={0.7} />
        </mesh>
      ))}
      {/* red trim rim along the edge */}
      {[
        { pos: [0, 0.21, 2.55] as [number, number, number], size: [5.2, 0.04, 0.1] as [number, number, number] },
        { pos: [0, 0.21, -2.55] as [number, number, number], size: [5.2, 0.04, 0.1] as [number, number, number] },
        { pos: [2.55, 0.21, 0] as [number, number, number], size: [0.1, 0.04, 5.2] as [number, number, number] },
        { pos: [-2.55, 0.21, 0] as [number, number, number], size: [0.1, 0.04, 5.2] as [number, number, number] },
      ].map((e, i) => (
        <mesh key={i} position={e.pos}>
          <boxGeometry args={e.size} />
          <meshStandardMaterial
            color="#b91c1c"
            emissive="#7f1d1d"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function ToriiGate({
  position,
}: {
  position: [number, number, number];
}) {
  // Iconic Japanese gate — two red pillars + two crossbeams.
  const red = "#b91c1c";
  const darkRed = "#7f1d1d";
  return (
    <group position={position}>
      {/* left pillar */}
      <mesh position={[-1.8, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.17, 4.0, 16]} />
        <meshStandardMaterial color={red} roughness={0.6} />
      </mesh>
      {/* right pillar */}
      <mesh position={[1.8, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.17, 4.0, 16]} />
        <meshStandardMaterial color={red} roughness={0.6} />
      </mesh>
      {/* top crossbeam (kasagi) — slightly wider, dark */}
      <mesh position={[0, 4.1, 0]} castShadow>
        <boxGeometry args={[4.4, 0.28, 0.5]} />
        <meshStandardMaterial color="#1e1b1b" roughness={0.7} />
      </mesh>
      {/* second crossbeam (shimaki) */}
      <mesh position={[0, 3.7, 0]} castShadow>
        <boxGeometry args={[4.0, 0.18, 0.35]} />
        <meshStandardMaterial color={darkRed} roughness={0.6} />
      </mesh>
      {/* center tablet */}
      <mesh position={[0, 3.9, 0.18]}>
        <boxGeometry args={[0.8, 0.3, 0.05]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function LanternPost({
  position,
}: {
  position: [number, number, number];
}) {
  const lantern = useRef<Mesh>(null);
  useFrame((state) => {
    if (!lantern.current) return;
    const m = lantern.current.material as { emissiveIntensity?: number };
    if (m.emissiveIntensity !== undefined) {
      // flicker like a paper lantern
      m.emissiveIntensity =
        1.8 + Math.sin(state.clock.elapsedTime * 9 + position[0]) * 0.25;
    }
  });
  return (
    <group position={position}>
      {/* post */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.4, 8]} />
        <meshStandardMaterial color="#1c1917" roughness={0.8} />
      </mesh>
      {/* cap */}
      <mesh position={[0, 2.42, 0]}>
        <boxGeometry args={[0.35, 0.05, 0.35]} />
        <meshStandardMaterial color="#1c1917" roughness={0.8} />
      </mesh>
      {/* glowing lantern */}
      <mesh ref={lantern} position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color="#fed7aa"
          emissive="#f97316"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
      {/* tiny point light so the lantern lights nearby plank ends */}
      <pointLight
        position={[0, 2.2, 0]}
        intensity={0.6}
        distance={3.5}
        color="#fb923c"
      />
    </group>
  );
}

function CenterEmblem() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.212, -2]}>
      <ringGeometry args={[0.55, 0.72, 32]} />
      <meshStandardMaterial
        color="#f8fafc"
        emissive="#f8fafc"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}
