"use client";

import { Shield } from "lucide-react";
import { usePunchCalibrationStore } from "@/lib/store/punchCalibrationStore";

// Bottom-center shield indicator that lights up whenever the local player
// is holding their guard (both calibrated hands report inGuard). Mirrors
// the derivation used in CalibrateGuardPanel.

export function GuardVignette() {
  const baseline = usePunchCalibrationStore((s) => s.baseline);
  const leftMetrics = usePunchCalibrationStore((s) => s.leftMetrics);
  const rightMetrics = usePunchCalibrationStore((s) => s.rightMetrics);

  const calibratedLeft = !!baseline?.left;
  const calibratedRight = !!baseline?.right;
  const anyCalibrated = calibratedLeft || calibratedRight;
  const inGuard =
    anyCalibrated &&
    (!calibratedLeft || leftMetrics.inGuard) &&
    (!calibratedRight || rightMetrics.inGuard);

  if (!inGuard) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2"
    >
      <Shield
        size={72}
        strokeWidth={2}
        className="text-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]"
        fill="black"
      />
    </div>
  );
}
