import { create } from "zustand";

// Pub-sub trigger for (re)calibration. The rematch flow calls
// requestRecalibrate() to bump the tick; GameLoadingOverlay watches it and
// re-enters its guard-leadin → guard-hold → guard-done sequence.

type CalibrationSignalStore = {
  requestTick: number;
  requestRecalibrate: () => void;
};

export const useCalibrationSignalStore = create<CalibrationSignalStore>((set) => ({
  requestTick: 0,
  requestRecalibrate: () => set((s) => ({ requestTick: s.requestTick + 1 })),
}));
