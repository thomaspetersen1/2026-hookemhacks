"use client";

import { useMemo } from "react";

export function GolfGreen() {
  // Putt-style green: fairway strip, green circle, pin with flag, ball.
  const trees = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      out.push([side * (3.5 + Math.random() * 0.8), 0, -2 - i * 1.1]);
    }
    return out;
  }, []);

  return (
    <group>
      {/* fairway strip — lighter green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -4]} receiveShadow>
        <planeGeometry args={[5, 14]} />
        <meshStandardMaterial color="#65a30d" roughness={0.85} />
      </mesh>

      {/* green — shorter, darker circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -9]} receiveShadow>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>

      {/* tee box (near player) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 1.8]}>
        <circleGeometry args={[0.5, 24]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.9} />
      </mesh>

      {/* ball on tee */}
      <mesh position={[0, 0.09, 1.8]} castShadow>
        <sphereGeometry args={[0.08, 20, 20]} />
        <meshStandardMaterial color="#fafafa" roughness={0.4} />
      </mesh>

      {/* pin + flag at the hole */}
      <mesh position={[0, 0.8, -9]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.6, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.3, 1.4, -9]} castShadow>
        <boxGeometry args={[0.55, 0.32, 0.02]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
      {/* hole cup */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -9]}>
        <circleGeometry args={[0.08, 20]} />
        <meshStandardMaterial color="#020617" />
      </mesh>

      {/* low-poly trees lining the fairway */}
      {trees.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
            <meshStandardMaterial color="#422006" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <coneGeometry args={[0.55, 1.4, 10]} />
            <meshStandardMaterial color="#14532d" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
