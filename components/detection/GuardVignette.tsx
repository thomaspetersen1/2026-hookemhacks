"use client";

import { Shield } from "lucide-react";
import { usePunchCalibrationStore } from "@/lib/store/punchCalibrationStore";

// Bottom-center shield that fades in based on how close the local player's
// wrists are to the calibrated guard position. Acts as a "warmer / colder"
// homing cue so the user can find the snap zone again after drifting out.
// Fully opaque + emerald when both calibrated hands are inGuard; faintly
// visible while approaching; hidden entirely when not calibrated.

export function GuardVignette() {
  const baseline = usePunchCalibrationStore((s) => s.baseline);
  const leftMetrics = usePunchCalibrationStore((s) => s.leftMetrics);
  const rightMetrics = usePunchCalibrationStore((s) => s.rightMetrics);

  const calibratedLeft = !!baseline?.left;
  const calibratedRight = !!baseline?.right;
  const anyCalibrated = calibratedLeft || calibratedRight;
  if (!anyCalibrated) return null;

  // Combined proximity is the worst (farther) of the calibrated hands so
  // both wrists need to home in. Uncalibrated sides don't gate.
  const leftProx = calibratedLeft ? leftMetrics.guardProximity : 1;
  const rightProx = calibratedRight ? rightMetrics.guardProximity : 1;
  const proximity = Math.min(leftProx, rightProx);

  const inGuard =
    (!calibratedLeft || leftMetrics.inGuard) &&
    (!calibratedRight || rightMetrics.inGuard);

  // Floor at 0.18 so the target is always visible when calibrated, even when
  // the user has wandered outside the falloff radius — gives them something
  // to home in on.
  const opacity = Math.max(0.18, proximity);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2 transition-opacity duration-100"
      style={{ opacity }}
    >
      <Shield
        size={72}
        strokeWidth={2}
        className={
          inGuard
            ? "text-emerald-300 drop-shadow-[0_0_14px_rgba(16,185,129,0.85)]"
            : "text-emerald-200/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
        }
        fill={inGuard ? "rgb(16,185,129)" : "rgba(16,185,129,0.18)"}
      />
    </div>
  );
}
