"use client";

// TEMPORARY DEBUG ROUTE — shows the raw output of teammate's CV pipeline so we
// can eyeball what the body detection is producing. Open /cv-debug in a real
// browser, grant webcam permission, and the arm/hand state panel + mirrored
// video+skeleton overlay should update in real time.
//
// Tear this route out once Track 1 integration is signed off.

import BodyDetector from "@/components/detection/BodyDetector";
import { useBodyDetection } from "@/hooks/useBodyDetection";
import Link from "next/link";

function toFixed(n: number | null | undefined, d = 2) {
  return n === null || n === undefined || Number.isNaN(n) ? "—" : n.toFixed(d);
}

function ArmBlock({
  label,
  arm,
}: {
  label: string;
  arm: ReturnType<typeof useBodyDetection>["leftArm"];
}) {
  return (
    <div className="rounded-lg border border-zinc-700/60 bg-black/60 p-4">
      <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-zinc-400">
        {label}
      </div>
      {arm ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm text-zinc-100">
          <span className="text-zinc-500">elbow angle</span>
          <span className="tabular-nums">{toFixed(arm.elbowAngle, 1)}°</span>

          <span className="text-zinc-500">forward angle</span>
          <span className="tabular-nums">
            {toFixed((arm.forwardAngle * 180) / Math.PI, 1)}°
          </span>

          <span className="text-zinc-500">raised height</span>
          <span className="tabular-nums">{toFixed(arm.raisedHeight, 3)}</span>

          <span className="text-zinc-500">swing speed</span>
          <span className="tabular-nums">{toFixed(arm.swingSpeed, 3)}</span>

          <span className="text-zinc-500">is extended</span>
          <span>{arm.isExtended ? "yes" : "no"}</span>
        </div>
      ) : (
        <div className="font-mono text-sm text-zinc-500">(not detected)</div>
      )}
    </div>
  );
}

function HandBlock({
  label,
  hand,
}: {
  label: string;
  hand: ReturnType<typeof useBodyDetection>["leftHand"];
}) {
  return (
    <div className="rounded-lg border border-zinc-700/60 bg-black/60 p-4">
      <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-zinc-400">
        {label}
      </div>
      {hand ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm text-zinc-100">
          <span className="text-zinc-500">gesture</span>
          <span className="text-cyan-300">{hand.gesture}</span>

          <span className="text-zinc-500">pinch distance</span>
          <span className="tabular-nums">{toFixed(hand.pinchDistance, 3)}</span>
        </div>
      ) : (
        <div className="font-mono text-sm text-zinc-500">(not detected)</div>
      )}
    </div>
  );
}

function CVPanel() {
  const { leftArm, rightArm, leftHand, rightHand, fps, isReady } =
    useBodyDetection();

  return (
    <div className="absolute inset-0 flex flex-col gap-4 overflow-auto bg-zinc-950 p-6 text-zinc-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-400">
            Track 1 · CV Debug
          </div>
          <h1 className="text-2xl font-bold">Body tracking live feed</h1>
        </div>
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white"
        >
          ← Home
        </Link>
      </div>

      <div className="flex items-center gap-3 font-mono text-sm text-zinc-300">
        <span
          className={`h-2 w-2 rounded-full ${
            isReady ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <span>{isReady ? "READY" : "waiting for webcam…"}</span>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-400">{fps} fps</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ArmBlock label="Left arm" arm={leftArm} />
        <ArmBlock label="Right arm" arm={rightArm} />
        <HandBlock label="Left hand" hand={leftHand} />
        <HandBlock label="Right hand" hand={rightHand} />
      </div>

      <div className="mt-2 rounded-lg border border-zinc-800 bg-black/40 p-4 font-mono text-xs leading-relaxed text-zinc-400">
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          pipeline
        </div>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            webcam → <code>MediaPipe PoseLandmarker + HandLandmarker</code>{" "}
            (teammate&apos;s <code>lib/mediapipe/pose.ts</code>)
          </li>
          <li>
            landmarks → <code>buildArmState</code> / <code>buildHandState</code>{" "}
            (teammate&apos;s <code>lib/mediapipe/gestures.ts</code>)
          </li>
          <li>
            arm/hand state published via{" "}
            <code>BodyTrackingContext</code>
          </li>
          <li>
            this page reads <code>useBodyDetection()</code> — so does{" "}
            <code>CVRigBridge</code> on <code>/game/demo</code>, which applies
            rotations to the avatar
          </li>
        </ol>
      </div>

      <div className="text-xs text-zinc-500">
        Debug canvas (mirrored video + green arm skeleton + colored hand
        landmarks) is pinned to the bottom-right corner by{" "}
        <code>&lt;BodyDetector debug&gt;</code>.
      </div>
    </div>
  );
}

export default function CVDebugPage() {
  return (
    <BodyDetector debug>
      <CVPanel />
    </BodyDetector>
  );
}
