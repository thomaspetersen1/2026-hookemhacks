import { create } from "zustand";

// Lightweight pub-sub for camera reset. GameCanvas' CameraController
// watches resetTick and snaps the camera back to the first-person POV
// at P1's head. Debug overlays call requestReset() to trigger it.

type CameraStore = {
  resetTick: number;
  requestReset: () => void;
};

export const useCameraStore = create<CameraStore>((set) => ({
  resetTick: 0,
  requestReset: () => set((s) => ({ resetTick: s.resetTick + 1 })),
}));
