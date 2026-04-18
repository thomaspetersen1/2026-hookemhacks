"use client";

import { useEffect, useState } from "react";
import { initPose, processFrame } from "@/lib/mediapipe/pose";

export function useBodyDetection() {
  const [landmarks, setLandmarks] = useState<unknown[]>([]);

  useEffect(() => {
    initPose();
  }, []);

  return { landmarks };
}
