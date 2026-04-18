"use client";

import dynamic from "next/dynamic";
import { ScoreHUD } from "@/components/game/ScoreHUD";

// R3F must never run on the server — dynamic(ssr:false) has to be invoked from
// a client component in Next 16, hence this thin wrapper.
const GameCanvas = dynamic(
  () => import("@/components/game/GameCanvas").then((m) => m.GameCanvas),
  { ssr: false, loading: () => <CanvasFallback /> }
);

function CanvasFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
        booting arena…
      </div>
    </div>
  );
}

export function GameRoomClient({
  roomId,
  debug,
}: {
  roomId: string;
  debug: boolean;
}) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <GameCanvas debug={debug} key={roomId} />
      <ScoreHUD />
      <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
        room · {roomId}
      </div>
    </div>
  );
}
