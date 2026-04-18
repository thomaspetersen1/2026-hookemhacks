"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { initPose, processFrame } from "@/lib/mediapipe/pose";
import { buildArmState, buildHandState } from "@/lib/mediapipe/gestures";
import type { BodyTrackingState, ArmState } from "@/types";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

// Pose landmark indices for arm joints
const POSE = { LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12, LEFT_ELBOW: 13, RIGHT_ELBOW: 14, LEFT_WRIST: 15, RIGHT_WRIST: 16 };

const defaultState: BodyTrackingState = {
  leftArm: null, rightArm: null,
  leftHand: null, rightHand: null,
  fps: 0, isReady: false,
};

export const BodyTrackingContext = createContext<BodyTrackingState>(defaultState);

export function useBodyDetection(): BodyTrackingState {
  return useContext(BodyTrackingContext);
}

export function useBodyDetectionProvider(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<BodyTrackingState>(defaultState);
  const prevWristsRef = useRef<{ left: NormalizedLandmark | null; right: NormalizedLandmark | null }>({ left: null, right: null });
  const prevTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const fpsRef = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });

  const loop = useCallback((timestamp: number) => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const dt = prevTimeRef.current ? (timestamp - prevTimeRef.current) / 1000 : 0;
    prevTimeRef.current = timestamp;

    const raw = processFrame(video, timestamp);

    let leftArm: ArmState | null = null;
    let rightArm: ArmState | null = null;

    if (raw.poseLandmarks.length > 0) {
      const lm = raw.poseLandmarks[0];
      leftArm = buildArmState(lm[POSE.LEFT_SHOULDER], lm[POSE.LEFT_ELBOW], lm[POSE.LEFT_WRIST], prevWristsRef.current.left, dt);
      rightArm = buildArmState(lm[POSE.RIGHT_SHOULDER], lm[POSE.RIGHT_ELBOW], lm[POSE.RIGHT_WRIST], prevWristsRef.current.right, dt);
      prevWristsRef.current = { left: lm[POSE.LEFT_WRIST], right: lm[POSE.RIGHT_WRIST] };
    }

    fpsRef.current.count++;
    const elapsed = timestamp - fpsRef.current.lastTime;
    const fps = elapsed > 500 ? Math.round((fpsRef.current.count / elapsed) * 1000) : undefined;
    if (fps !== undefined) { fpsRef.current = { count: 0, lastTime: timestamp }; }

    setState((prev) => ({
      leftArm,
      rightArm,
      leftHand: raw.leftHandLandmarks ? buildHandState(raw.leftHandLandmarks) : null,
      rightHand: raw.rightHandLandmarks ? buildHandState(raw.rightHandLandmarks) : null,
      fps: fps ?? prev.fps,
      isReady: true,
    }));

    rafRef.current = requestAnimationFrame(loop);
  }, [videoRef]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        await initPose();
        if (!cancelled) rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        console.error("Body tracking init failed:", e);
      }
    }

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
    };
  }, [loop, videoRef]);

  return state;
}
