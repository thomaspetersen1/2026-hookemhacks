"use client";

import dynamic from "next/dynamic";
import BodyDetector from "@/components/detection/BodyDetector";
import { CVRigBridge } from "@/components/detection/CVRigBridge";
import { SELF_PLAYER_ID } from "@/types";

const ArmScene = dynamic(
  () => import("@/components/game/ArmScene").then((m) => m.ArmScene),
  { ssr: false }
);

export default function ArmTestPage() {
  return (
    <BodyDetector debug>
      <CVRigBridge playerId={SELF_PLAYER_ID} />
      <div style={{ width: "100dvw", height: "100dvh" }}>
        <ArmScene />
      </div>
    </BodyDetector>
  );
}
