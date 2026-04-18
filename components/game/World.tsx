"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import type { Sport } from "@/types";
import { SwordArena } from "./props/SwordArena";
import { TennisCourt } from "./props/TennisCourt";
import { GolfGreen } from "./props/GolfGreen";

interface WorldProps {
  sport: Sport;
}

// A neon-lit arena shell that swaps its court prop based on the active sport.
// Arena geometry (floor, walls, pulsing lights) stays constant so sport changes
// feel like zone swaps, not full scene reloads.

export function World({ sport }: WorldProps) {
  return (
    <group>
      <ArenaShell />
      <SportZone sport={sport} />
    </group>
  );
}

function ArenaShell() {
  const neonA = useRef<Mesh>(null);
  const neonB = useRef<Mesh>(null);
  const neonC = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Subtle neon breathing — keeps the arena feeling alive without distraction.
    const pulse = (phase: number) => 1.4 + Math.sin(t * 1.6 + phase) * 0.25;
    if (neonA.current) {
      const m = neonA.current.material as { emissiveIntensity?: number };
      if (m.emissiveIntensity !== undefined) m.emissiveIntensity = pulse(0);
    }
    if (neonB.current) {
      const m = neonB.current.material as { emissiveIntensity?: number };
      if (m.emissiveIntensity !== undefined) m.emissiveIntensity = pulse(2.1);
    }
    if (neonC.current) {
      const m = neonC.current.material as { emissiveIntensity?: number };
      if (m.emissiveIntensity !== undefined) m.emissiveIntensity = pulse(4.2);
    }
  });

  return (
    <group>
      {/* arena floor (outside the sport zone) — dark polished concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0b0f1a" roughness={0.35} metalness={0.4} />
      </mesh>

      {/* back wall */}
      <mesh position={[0, 5, -12]} receiveShadow>
        <boxGeometry args={[40, 10, 0.4]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* side walls */}
      <mesh position={[-14, 5, 0]} receiveShadow>
        <boxGeometry args={[0.4, 10, 30]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>
      <mesh position={[14, 5, 0]} receiveShadow>
        <boxGeometry args={[0.4, 10, 30]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* neon accent strips on back wall */}
      <mesh ref={neonA} position={[-6, 7, -11.75]}>
        <boxGeometry args={[8, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={neonB} position={[6, 7, -11.75]}>
        <boxGeometry args={[8, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={neonC} position={[0, 2.5, -11.75]}>
        <boxGeometry args={[18, 0.08, 0.05]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#f97316"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      {/* ceiling rigging bar with clamp-on lights (just geometric suggestion) */}
      <mesh position={[0, 9.5, -4]}>
        <boxGeometry args={[24, 0.1, 0.1]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.4} />
      </mesh>
      <CrowdRibbon side="left" />
      <CrowdRibbon side="right" />
    </group>
  );
}

function CrowdRibbon({ side }: { side: "left" | "right" }) {
  // Cheap crowd stand-in: a ribbon of low-poly "heads" at a raked angle.
  const root = useRef<Group>(null);
  const count = 40;
  const xSign = side === "left" ? -1 : 1;

  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const row = i % 5;
      const col = Math.floor(i / 5);
      pts.push([
        xSign * (8 + row * 0.5),
        1.8 + row * 0.45,
        -8 + col * 2.1,
      ]);
    }
    return pts;
  }, [xSign]);

  useFrame((state) => {
    if (!root.current) return;
    // faint bob — the crowd is "into it"
    const t = state.clock.elapsedTime;
    root.current.children.forEach((child, i) => {
      child.position.y = positions[i][1] + Math.sin(t * 2 + i * 0.7) * 0.04;
    });
  });

  return (
    <group ref={root}>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#334155" : i % 3 === 1 ? "#475569" : "#1e293b"}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

function SportZone({ sport }: { sport: Sport }) {
  switch (sport) {
    case "swords":
      return <SwordArena />;
    case "tennis":
      return <TennisCourt />;
    case "golf":
      return <GolfGreen />;
  }
}
