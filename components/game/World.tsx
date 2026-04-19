"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import type { Sport } from "@/types";
import { SwordArena } from "./props/SwordArena";
import { TennisCourt } from "./props/TennisCourt";
import { GolfGreen } from "./props/GolfGreen";
import { BoxingRing } from "./props/BoxingRing";
import { PirateShip } from "./props/PirateShip";
import { Cove } from "./props/Cove";

// Tropical-sunset arena — matches the landing-UI aesthetic (volcano, ocean,
// palms, warm sky) instead of the old neon concrete arena. Sport props still
// swap on top so each game zone feels distinct.

interface WorldProps {
  sport: Sport;
}

const COLOR_SAND = "#FFE5B4";
const COLOR_SAND_WARM = "#F5C978";
const COLOR_SUN = "#FF6B4A";
const COLOR_LAVA = "#FF3D1F";
const COLOR_VOLCANO = "#3A2E4C";
const COLOR_VOLCANO_DEEP = "#261E35";
const COLOR_OCEAN = "#1F4C6B";
const COLOR_OCEAN_LIGHT = "#3A7C9C";
const COLOR_FOAM = "#E6DFD0";
const COLOR_PALM_TRUNK = "#5A3E2A";
const COLOR_FROND = "#2E6E3B";

export function World({ sport }: WorldProps) {
  return (
    <group>
      <ArenaShell />
      <SportZone sport={sport} />
    </group>
  );
}

function ArenaShell() {
  return (
    <group>
      {/* Sand floor — large enough to fill the camera-framed ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={COLOR_SAND} roughness={1.0} />
      </mesh>

      {/* Wet-sand strip near the water (darker warm) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -10]}>
        <planeGeometry args={[60, 4]} />
        <meshStandardMaterial color={COLOR_SAND_WARM} roughness={1.0} />
      </mesh>

      {/* Ocean — wide flat plane behind the beach, gently animated */}
      <Ocean />

      {/* Sky dome — inverted sphere with a vertical gradient painted on the
          inside via vertex color. Simpler than HDRI and matches the landing
          gradient (warm peach at the top through coral, crimson at the
          horizon where it meets the ocean). */}
      <SkyDome />

      {/* Sun disc at the horizon — emissive ball with a bloom-ish halo via
          scale-and-transparent shell */}
      <Sun />

      {/* Main volcano — a truncated cone centered-back with lava glow at the
          crater, per the landing backdrop */}
      <Volcano position={[2, 0, -22]} height={10} baseRadius={7} />

      {/* Left cove — volcano mountain with a rocky inlet that opens toward
          the pirate ship, replacing the plain background mountain */}
      <Cove position={[-9, 0, -18]} />

      {/* Cove off to the right — rocky inlet with its own volcano */}
      <Cove position={[17, 0, -19]} />

      {/* Pirate ship sailing the open water, mid-left — kept clear of both
          volcanoes' silhouettes and parked where the deep ocean is visible */}
      <PirateShip
        position={[-7, 0.35, -12]}
        rotation={[0, Math.PI * 0.22, 0]}
      />

      {/* Palm trees lining the beach on both sides */}
      <PalmCluster side="left" />
      <PalmCluster side="right" />
    </group>
  );
}

function Ocean() {
  const ref = useRef<Mesh>(null);
  const foamA = useRef<Mesh>(null);
  const foamB = useRef<Mesh>(null);
  const foamC = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Gentle horizontal drift for subtle water motion
    if (ref.current) {
      ref.current.position.x = Math.sin(t * 0.18) * 0.6;
    }
    // Each foam strip drifts on its own sine so the ocean feels alive
    if (foamA.current) {
      foamA.current.position.x = Math.sin(t * 0.22) * 1.4;
    }
    if (foamB.current) {
      foamB.current.position.x = Math.cos(t * 0.16 + 0.8) * 1.8;
    }
    if (foamC.current) {
      foamC.current.position.x = Math.sin(t * 0.12 + 2.1) * 1.2;
    }
  });
  return (
    <group>
      {/* Deep ocean (far) — raised just above the sand plane so the blue
          actually shows instead of being hidden beneath it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -18]}>
        <planeGeometry args={[120, 18]} />
        <meshStandardMaterial color={COLOR_OCEAN} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Shore water (closer, lighter, drifting) */}
      <mesh
        ref={ref}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, -11]}
      >
        <planeGeometry args={[60, 3]} />
        <meshStandardMaterial
          color={COLOR_OCEAN_LIGHT}
          transparent
          opacity={0.75}
          roughness={0.4}
          metalness={0.4}
        />
      </mesh>
      {/* Foam/wave strips at staggered depths, each drifting independently */}
      <mesh
        ref={foamA}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, -13.5]}
      >
        <planeGeometry args={[80, 0.28]} />
        <meshStandardMaterial
          color={COLOR_FOAM}
          transparent
          opacity={0.38}
          roughness={0.5}
        />
      </mesh>
      <mesh
        ref={foamB}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, -16.5]}
      >
        <planeGeometry args={[90, 0.22]} />
        <meshStandardMaterial
          color={COLOR_FOAM}
          transparent
          opacity={0.32}
          roughness={0.5}
        />
      </mesh>
      <mesh
        ref={foamC}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, -20]}
      >
        <planeGeometry args={[100, 0.26]} />
        <meshStandardMaterial
          color={COLOR_FOAM}
          transparent
          opacity={0.28}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

function SkyDome() {
  // Hemisphere behind everything. Single flat color per sphere; we stack two
  // spheres (outer = high sky, inner clipped to lower = ocean band) for a
  // simple gradient feel.
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[80, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#FFB384" side={2} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[79.5, 32, 16, 0, Math.PI * 2, Math.PI / 3, Math.PI / 6]} />
        <meshBasicMaterial color="#FF9764" side={2} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function Sun() {
  return (
    <group position={[6, 6, -25]}>
      {/* Halo */}
      <mesh>
        <sphereGeometry args={[3.2, 24, 24]} />
        <meshBasicMaterial color={COLOR_SUN} transparent opacity={0.22} toneMapped={false} />
      </mesh>
      {/* Disc */}
      <mesh>
        <sphereGeometry args={[1.8, 24, 24]} />
        <meshBasicMaterial color="#FFD88A" toneMapped={false} />
      </mesh>
    </group>
  );
}

interface VolcanoProps {
  position: [number, number, number];
  height: number;
  baseRadius: number;
  color?: string;
  hasLava?: boolean;
}

function Volcano({
  position,
  height,
  baseRadius,
  color = COLOR_VOLCANO,
  hasLava = true,
}: VolcanoProps) {
  const lavaRef = useRef<Mesh>(null);
  useFrame((state) => {
    if (!lavaRef.current) return;
    const t = state.clock.elapsedTime;
    const m = lavaRef.current.material as { emissiveIntensity?: number };
    if (m.emissiveIntensity !== undefined) {
      m.emissiveIntensity = 1.4 + Math.sin(t * 2.0) * 0.3;
    }
  });
  const topRadius = baseRadius * 0.25;
  return (
    <group position={position}>
      {/* Truncated cone so the top is a flat crater the lava disc can sit in,
          instead of tapering to a sharp point that hides the glow */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[topRadius, baseRadius, height, 20, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {hasLava && (
        <mesh ref={lavaRef} position={[0, height + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[topRadius, 20]} />
          <meshStandardMaterial
            color={COLOR_LAVA}
            emissive={COLOR_LAVA}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

function PalmCluster({ side }: { side: "left" | "right" }) {
  const sign = side === "left" ? -1 : 1;
  // Staggered palm positions — lined along the beach, angled slightly so each
  // tree reads as individual even from the player's fixed camera.
  const palms = useMemo(
    () =>
      [
        { x: sign * 9, z: -2, height: 3.2, lean: 0.08 },
        { x: sign * 11, z: -6, height: 3.8, lean: -0.06 },
        { x: sign * 8, z: 2, height: 2.8, lean: 0.12 },
        { x: sign * 12, z: -12, height: 3.5, lean: 0.04 },
      ] as const,
    [sign],
  );
  return (
    <group>
      {palms.map((p, i) => (
        <PalmTree key={i} position={[p.x, 0, p.z]} height={p.height} lean={p.lean * sign} />
      ))}
    </group>
  );
}

function PalmTree({
  position,
  height,
  lean,
}: {
  position: [number, number, number];
  height: number;
  lean: number;
}) {
  const trunkSegments = 4;
  const trunkWidth = 0.14;
  return (
    <group position={position} rotation={[0, 0, lean]}>
      {/* Trunk — segmented cylinder sections for a palm-like profile */}
      {Array.from({ length: trunkSegments }).map((_, i) => {
        const y = (height / trunkSegments) * (i + 0.5);
        const r = trunkWidth * (1 - i * 0.08);
        return (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <cylinderGeometry args={[r * 0.9, r, height / trunkSegments, 10]} />
            <meshStandardMaterial color={COLOR_PALM_TRUNK} roughness={0.95} />
          </mesh>
        );
      })}

      {/* Crown — 8 broad flat leaves arcing outward from the top, each
          drooping toward the tip so the whole canopy reads as a proper
          palm fan instead of a spike ring */}
      <group position={[0, height, 0]}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const tilt = -0.55; // droop downward
          const len = 1.4 + (i % 2) * 0.25; // slight length variation
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh
                position={[len / 2, -0.05, 0]}
                rotation={[0, 0, tilt]}
                castShadow
              >
                {/* flat wide leaf — long box, thin, tapered visual via scale */}
                <boxGeometry args={[len, 0.04, 0.32]} />
                <meshStandardMaterial
                  color={COLOR_FROND}
                  roughness={0.8}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Coconut cluster just below the crown */}
      <group position={[0, height - 0.15, 0]}>
        {[
          [0.12, 0, 0.06],
          [-0.1, -0.04, 0.08],
          [0.04, -0.08, -0.12],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} castShadow>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color="#3C2418" roughness={0.7} />
          </mesh>
        ))}
      </group>
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
    case "boxing":
      return <BoxingRing />;
  }
}
