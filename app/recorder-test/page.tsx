"use client";

// DEV-ONLY ROUTE — tests the MediaRecorder chunk pipeline end-to-end.
// Open /recorder-test in a browser, grant webcam access, and use the controls
// to start/stop recording. Each 5-second chunk is logged and can be played
// back inline to verify standalone-playability (including chunks 1+).
// Delete this route once the recorder is wired into the real game flow.

import { useCallback, useRef, useState } from "react";
import BodyDetector from "@/components/detection/BodyDetector";
import { useBodyDetection } from "@/hooks/useBodyDetection";
import { useRecorder } from "@/lib/recorder";
import type { ChunkReady } from "@/lib/recorder";
import Link from "next/link";

type ChunkEntry = {
  chunk: ChunkReady;
  url: string;
};

function RecorderTestPanel() {
  const { overlayCanvasRef, videoRef, isReady, fps } = useBodyDetection();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamCaptured = useRef(false);

  // Capture stream once body detection signals the webcam is live.
  // We use a ref guard so we only call setStream once even if isReady flickers.
  if (isReady && !streamCaptured.current && videoRef?.current?.srcObject) {
    streamCaptured.current = true;
    setStream(videoRef.current.srcObject as MediaStream);
  }

  const [entries, setEntries] = useState<ChunkEntry[]>([]);

  const handleChunk = useCallback((chunk: ChunkReady) => {
    const url = URL.createObjectURL(chunk.blob);
    console.log(
      `[recorder-test] chunk ${chunk.chunkIndex} — ${chunk.durationMs}ms — ${(chunk.blob.size / 1024).toFixed(0)} KB — ${url}`,
    );
    setEntries((prev) => [...prev, { chunk, url }]);
  }, []);

  const { state, error, start, stop } = useRecorder(
    stream,
    { chunkDurationMs: 5_000 },
    handleChunk,
  );

  const matchId = "recorder-test";
  const playerId = "dev";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "420px 1fr",
        gap: 24,
        height: "100vh",
        padding: 24,
        background: "#0f0c18",
        color: "#f5eeff",
        fontFamily: "monospace",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Left column: camera + controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#9c82c0", textTransform: "uppercase" }}>
              Dev · Recorder test
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontFamily: "sans-serif", fontWeight: 700 }}>
              MediaRecorder pipeline
            </h1>
          </div>
          <Link href="/" style={{ fontSize: 11, color: "#9c82c0", textDecoration: "none" }}>
            ← Home
          </Link>
        </div>

        {/* Camera feed */}
        <div
          style={{
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            border: "1.5px solid rgba(255,255,255,0.08)",
            aspectRatio: "4/3",
            background: "#000",
            flexShrink: 0,
          }}
        >
          <canvas
            ref={overlayCanvasRef}
            width={640}
            height={480}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />

          {/* Status overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.1em",
                background: "rgba(0,0,0,0.6)",
                borderRadius: 6,
                padding: "3px 8px",
                color: isReady ? "#2e7d5b" : "#f5c978",
              }}
            >
              {isReady ? `LIVE · ${fps} fps` : "WAITING"}
            </span>
            {state === "recording" && (
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  background: "rgba(0,0,0,0.6)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  color: "#ff3d1f",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#ff3d1f",
                    display: "inline-block",
                    animation: "pulse 1s ease-in-out infinite",
                  }}
                />
                REC
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.07)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#9c82c0", textTransform: "uppercase" }}>
            Controls
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => start(matchId, playerId)}
              disabled={state !== "idle" || !stream}
              style={btnStyle(state === "idle" && !!stream, "start")}
            >
              Start recording
            </button>
            <button
              type="button"
              onClick={() => stop()}
              disabled={state !== "recording"}
              style={btnStyle(state === "recording", "stop")}
            >
              Stop
            </button>
          </div>

          <div style={{ fontSize: 11, color: stateColor(state) }}>
            state: <strong>{state}</strong>
            {error && <span style={{ color: "#ff3d1f", marginLeft: 8 }}>{error.message}</span>}
          </div>

          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
            Chunks fire every 5 s. Chunks 1+ have the init segment prepended —
            each should play standalone. Check the console for blob URLs.
          </div>
        </div>
      </div>

      {/* Right column: chunk log + inline playback */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0, overflowY: "auto" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#9c82c0", textTransform: "uppercase", flexShrink: 0 }}>
          Chunks emitted — {entries.length}
        </div>

        {entries.length === 0 && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", padding: "20px 0" }}>
            No chunks yet. Start recording to see them here.
          </div>
        )}

        {entries.map(({ chunk, url }) => (
          <div
            key={chunk.chunkIndex}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ color: "#2e7d5b", fontWeight: 700, fontSize: 13 }}>
                #{chunk.chunkIndex}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                {(chunk.durationMs / 1000).toFixed(2)} s
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                {(chunk.blob.size / 1024).toFixed(0)} KB
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>
                started {new Date(chunk.startedAt).toLocaleTimeString()}
              </span>
            </div>

            {/* Inline playback — this is the critical test for standalone-playability */}
            <video
              src={url}
              controls
              style={{
                width: "100%",
                borderRadius: 6,
                background: "#000",
                maxHeight: 180,
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function btnStyle(active: boolean, variant: "start" | "stop"): React.CSSProperties {
  return {
    flex: 1,
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    cursor: active ? "pointer" : "not-allowed",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: 700,
    letterSpacing: "0.05em",
    opacity: active ? 1 : 0.35,
    background: variant === "start" ? "#2e7d5b" : "rgba(255,61,31,0.25)",
    color: variant === "start" ? "#fff" : "#ff3d1f",
    outline: variant === "stop" ? "1px solid rgba(255,61,31,0.4)" : "none",
  } as React.CSSProperties;
}

function stateColor(state: string): string {
  if (state === "recording") return "#ff3d1f";
  if (state === "error") return "#ff5e7e";
  if (state === "stopping") return "#f5c978";
  return "rgba(255,255,255,0.4)";
}

export default function RecorderTestPage() {
  return (
    <BodyDetector>
      <RecorderTestPanel />
    </BodyDetector>
  );
}
