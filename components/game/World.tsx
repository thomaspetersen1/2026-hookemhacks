"use client";

export default function World() {
  return (
    <mesh>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
}
