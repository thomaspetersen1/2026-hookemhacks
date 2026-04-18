"use client";

import dynamic from "next/dynamic";
import BodyDetector from "@/components/detection/BodyDetector";
import { CVRigBridge } from "@/components/detection/CVRigBridge";
import { SELF_PLAYER_ID } from "@/types";

const RodScene = dynamic(
  () => import("@/components/game/RodScene").then((m) => m.RodScene),
  { ssr: false }
);

export default function RodsPage() {
  return (
    <BodyDetector debug>
      <CVRigBridge playerId={SELF_PLAYER_ID} />
      <div className="relative h-screen w-screen overflow-hidden bg-black">
        <RodScene />
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          rods · CV driven · third-person
        </div>
      </div>
    </BodyDetector>
  );
}
