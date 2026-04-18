"use client";

import { useBodyDetection } from "@/hooks/useBodyDetection";

export default function BodyDetector() {
  const { landmarks } = useBodyDetection();
  return <video autoPlay playsInline style={{ display: "none" }} />;
}
