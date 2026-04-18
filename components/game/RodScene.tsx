"use client";

import { Canvas } from "@react-three/fiber";
import { SELF_PLAYER_ID } from "@/types";
import { RodAvatar } from "./RodAvatar";

export function RodScene() {
  return (
    <Canvas camera={{ position: [0, 0, 1.8], fov: 45 }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 4, 3]} intensity={0.9} />
      <RodAvatar playerId={SELF_PLAYER_ID} position={[0, 0.3, 0]} />
    </Canvas>
  );
}
