"use client";

import dynamic from "next/dynamic";
import BodyDetector from "@/components/detection/BodyDetector";
import { CVRigBridge } from "@/components/detection/CVRigBridge";
import { SELF_PLAYER_ID } from "@/types";

// Self-contained 3D avatar block for embedding inside any 2D UI container.
// Drops in where a <FigureSilhouette /> used to live — the parent just needs
// to give it a sized box and the Three.js canvas fills it. Opens the webcam
// via BodyDetector, pipes CV through CVRigBridge to the pose store, and
// renders the R3F scene. Only mount one of these per page (single webcam).

const GameCanvas = dynamic(
  () => import("./GameCanvas").then((m) => m.GameCanvas),
  { ssr: false, loading: () => <Booting /> }
);

function Booting() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        fontSize: 10,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.4)",
      }}
    >
      booting arena…
    </div>
  );
}

export function AvatarStage({ debug = false }: { debug?: boolean }) {
  return (
    <BodyDetector debug={debug}>
      <CVRigBridge playerId={SELF_PLAYER_ID} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          overflow: "hidden",
        }}
      >
        <GameCanvas debug={debug} />
      </div>
    </BodyDetector>
  );
}
