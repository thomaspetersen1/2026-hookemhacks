"use client";

export function TennisCourt() {
  // Half-court scaled to the arena — player on near baseline, net at back.
  return (
    <group>
      {/* court surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -3]} receiveShadow>
        <planeGeometry args={[6, 12]} />
        <meshStandardMaterial color="#1e40af" roughness={0.7} />
      </mesh>

      {/* white lines — singles sidelines + baseline + service box */}
      <Line x={-2.7} z={-3} length={12} axis="z" />
      <Line x={2.7} z={-3} length={12} axis="z" />
      <Line x={0} z={3} length={6} axis="x" />
      <Line x={0} z={-9} length={6} axis="x" />
      <Line x={0} z={-3} length={6} axis="x" />
      <Line x={0} z={-3} length={6} axis="z" />

      {/* net */}
      <mesh position={[0, 0.55, -3]} castShadow>
        <boxGeometry args={[6.2, 1.1, 0.04]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.75} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.15, -3]}>
        <boxGeometry args={[6.4, 0.06, 0.06]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}

function Line({
  x,
  z,
  length,
  axis,
}: {
  x: number;
  z: number;
  length: number;
  axis: "x" | "z";
}) {
  const size: [number, number, number] =
    axis === "z" ? [0.06, 0.02, length] : [length, 0.02, 0.06];
  return (
    <mesh position={[x, 0.02, z]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#f8fafc" />
    </mesh>
  );
}
