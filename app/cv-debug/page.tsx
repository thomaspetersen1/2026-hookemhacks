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
import { useEffect, useRef, useState } from "react";

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
  baseline,
}: {
  label: string;
  hand: ReturnType<typeof useBodyDetection>["leftHand"];
  baseline: number | null;
}) {
  const ratio = hand?.fistSize && baseline ? hand.fistSize / baseline : null;

  return (
    <div className={`rounded-lg border p-4 transition-colors duration-100 ${hand?.isPunching ? "border-red-400 bg-red-950/60" : "border-zinc-700/60 bg-black/60"}`}>
      <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-zinc-400">
        {label} {hand?.isPunching && <span className="text-red-400 font-bold">PUNCH!</span>}
      </div>
      {hand ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm text-zinc-100">
          <span className="text-zinc-500">gesture</span>
          <span className="text-cyan-300">{hand.gesture}</span>

          <span className="text-zinc-500">pinch distance</span>
          <span className="tabular-nums">{toFixed(hand.pinchDistance, 3)}</span>

          <span className="text-zinc-500">fist size</span>
          <span className="tabular-nums">{toFixed(hand.fistSize, 4)}</span>

          <span className="text-zinc-500">baseline</span>
          <span className="tabular-nums">{baseline !== null ? toFixed(baseline, 4) : "—"}</span>

          <span className="text-zinc-500">ratio</span>
          <span className={`tabular-nums font-bold ${ratio !== null && ratio >= 1.5 ? "text-red-400" : "text-zinc-100"}`}>
            {ratio !== null ? toFixed(ratio, 3) : "—"}
          </span>

          <span className="text-zinc-500">punching</span>
          <span className={hand.isPunching ? "text-red-400 font-bold" : "text-zinc-500"}>
            {hand.isPunching ? "YES — tracking…" : "no"}
          </span>
        </div>
      ) : (
        <div className="font-mono text-sm text-zinc-500">(not detected)</div>
      )}
    </div>
  );
}

function CVPanel() {
  const { leftArm, rightArm, leftHand, rightHand, fps, isReady, startFistCalibration, isFistCalibrating, fistCalibration, punchEvents } =
    useBodyDetection();

  const [calProgress, setCalProgress] = useState(0);
  const [punchLog, setPunchLog] = useState<{ id: number; hand: string; ratio: string }[]>([]);
  const punchLogId = useRef(0);

  useEffect(() => {
    if (!isFistCalibrating) { setCalProgress(0); return; }
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 5000) * 100);
      setCalProgress(p);
      if (p >= 100) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [isFistCalibrating]);

  useEffect(() => {
    if (punchEvents.length === 0) return;
    const entries = punchEvents.map((e) => ({ id: ++punchLogId.current, hand: e.hand, ratio: e.enlargementRatio.toFixed(3) }));
    setPunchLog((prev) => [...entries, ...prev].slice(0, 8));
  }, [punchEvents]);

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

      {/* Fist calibration controls */}
      <div className="rounded-lg border border-zinc-700/60 bg-black/60 p-4">
        <div className="mb-3 text-[10px] uppercase tracking-[0.25em] text-zinc-400">Fist Calibration</div>
        <div className="flex items-center gap-4">
          <button
            onClick={startFistCalibration}
            disabled={isFistCalibrating}
            className="rounded bg-cyan-600 px-4 py-2 font-mono text-sm text-white disabled:opacity-50 hover:bg-cyan-500 transition-colors"
          >
            {isFistCalibrating ? "Calibrating…" : "Start Fist Cal"}
          </button>
          <div className="flex-1">
            {isFistCalibrating && (
              <div className="h-2 w-full rounded bg-zinc-800 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded transition-all" style={{ width: `${calProgress}%` }} />
              </div>
            )}
            {!isFistCalibrating && (
              <div className="font-mono text-xs text-zinc-400">
                L baseline: {fistCalibration.left ? fistCalibration.left.baselineFistSize.toFixed(4) : "—"} &nbsp;|&nbsp;
                R baseline: {fistCalibration.right ? fistCalibration.right.baselineFistSize.toFixed(4) : "—"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ArmBlock label="Left arm" arm={leftArm} />
        <ArmBlock label="Right arm" arm={rightArm} />
        <HandBlock label="Left hand" hand={leftHand} baseline={fistCalibration.left?.baselineFistSize ?? null} />
        <HandBlock label="Right hand" hand={rightHand} baseline={fistCalibration.right?.baselineFistSize ?? null} />
      </div>

      {/* Punch event log */}
      <div className="rounded-lg border border-zinc-700/60 bg-black/60 p-4">
        <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-zinc-400">Punch Log</div>
        {punchLog.length === 0
          ? <div className="font-mono text-xs text-zinc-600">No punches detected yet — calibrate first, then punch toward the camera</div>
          : <div className="space-y-1 font-mono text-xs">
              {punchLog.map((e) => (
                <div key={e.id} className="flex gap-4 text-zinc-300">
                  <span className="text-red-400 font-bold uppercase">{e.hand}</span>
                  <span>ratio: <span className="text-white">{e.ratio}</span></span>
                </div>
              ))}
            </div>
        }
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
