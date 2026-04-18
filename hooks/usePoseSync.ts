"use client";

import { useEffect, useRef } from "react";
import { usePoseStore } from "@/lib/store/poseStore";
import type { PlayerId, PoseLandmark } from "@/types";

// TRACK 3 — replace this stub with Supabase Realtime broadcast for pose frames.
// Responsibilities:
//   1. Throttle local pose broadcasts to 10-15fps (see HOOKEMHACKS_CONTEXT.md
//      "Multiplayer pose sync bandwidth" — throttle, quantize, or send deltas).
//   2. Receive remote pose frames and push them into usePoseStore under the
//      sender's PlayerId.
//
// Suggested wire format (keep compact — 33 * 3 floats is ~400 bytes already):
//   { t: number; lm: Array<[x,y,z]>; }  // visibility dropped remote-side

const BROADCAST_HZ = 12;

export interface UsePoseSyncOptions {
  roomId: string;
  selfId: PlayerId;
}

export function usePoseSync({ roomId, selfId }: UsePoseSyncOptions) {
  const lastSendMs = useRef(0);

  useEffect(() => {
    // Stub: no real channel. Track 3 subscribes here.
    const interval = 1000 / BROADCAST_HZ;

    const unsub = usePoseStore.subscribe((state) => {
      const now = performance.now();
      if (now - lastSendMs.current < interval) return;

      const mine = state.players[selfId];
      if (!mine?.landmarks) return;

      lastSendMs.current = now;

      // Track 3: replace with `channel.send({ type: "broadcast", event: "pose", payload: { ... } })`
      void mine;
      void roomId;
    });

    return () => {
      unsub();
    };
  }, [roomId, selfId]);
}

/**
 * Track 3 calls this when a remote pose frame arrives on the Realtime channel.
 * Exposed as a pure utility so it's unit-testable without mounting React.
 */
export function applyRemotePoseFrame(
  playerId: PlayerId,
  landmarks: PoseLandmark[],
  timestampMs: number
) {
  usePoseStore.getState().setLandmarks(playerId, landmarks, timestampMs);
}
