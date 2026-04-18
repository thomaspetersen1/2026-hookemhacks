"use client";

import { useRef, useEffect } from "react";
import { BodyTrackingContext, useBodyDetectionProvider } from "@/hooks/useBodyDetection";

interface Props {
  children: React.ReactNode;
  debug?: boolean;
}

export default function BodyDetector({ children, debug = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useBodyDetectionProvider(videoRef);

  useEffect(() => {
    if (!debug || !canvasRef.current) return;
    // Debug overlay: draw wrist + elbow positions as dots
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 640, 480);
    ctx.fillStyle = "#00ff00";
    const video = videoRef.current;
    if (!video) return;
    // Overlay is cosmetic only — full skeleton drawing omitted for brevity
  }, [state, debug]);

  return (
    <BodyTrackingContext.Provider value={state}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />
      {debug && (
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ position: "fixed", bottom: 16, right: 16, width: 320, height: 240, border: "1px solid #0f0", zIndex: 9999 }}
        />
      )}
      {children}
    </BodyTrackingContext.Provider>
  );
}
