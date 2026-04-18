"use client";

import { Canvas } from "@react-three/fiber";
import World from "./World";
import Avatar from "./Avatar";

export default function GameCanvas() {
  return (
    <Canvas>
      <ambientLight />
      <World />
      <Avatar />
    </Canvas>
  );
}
