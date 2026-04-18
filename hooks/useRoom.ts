"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/store/gameStore";
import { REMOTE_PLAYER_ID } from "@/types";

// TRACK 3 — replace this stub with a Supabase Realtime presence channel.
// Responsibility: watch room presence events and flip the matching player's
// isConnected flag in the game store.
//
// Suggested shape:
//   const channel = supabase.channel(`room:${roomId}`, { config: { presence: { key: userId } } });
//   channel.on("presence", { event: "sync" }, () => { ... });
//   channel.on("presence", { event: "join" }, ({ key }) => setPlayerConnected(key, true));
//   channel.on("presence", { event: "leave" }, ({ key }) => setPlayerConnected(key, false));
//   channel.subscribe(async (status) => { if (status === "SUBSCRIBED") channel.track({ online: true }); });

export interface UseRoomOptions {
  roomId: string;
  userId?: string;
}

export function useRoom({ roomId }: UseRoomOptions) {
  const setPlayerConnected = useGameStore((s) => s.setPlayerConnected);

  useEffect(() => {
    // Stub: no-op. Track 3 wires Supabase Realtime here.
    // Expose a manual offline-on-unmount so devs can fake a disconnect flow.
    return () => {
      setPlayerConnected(REMOTE_PLAYER_ID, false);
    };
  }, [roomId, setPlayerConnected]);

  return {
    roomId,
    isReady: false, // Track 3: flip to true once channel subscribes
  };
}
