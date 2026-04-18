"use client";

import { useEffect } from "react";
import { subscribeToRoom } from "@/lib/supabase/realtime";
import { supabase } from "@/lib/supabase/client";

export function usePoseSync(roomId: string, onRemotePose: (pose: unknown) => void) {
  useEffect(() => {
    const channel = subscribeToRoom(roomId, ({ payload }) => onRemotePose(payload));
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  function broadcastPose(pose: unknown) {
    supabase.channel(`room:${roomId}`).send({ type: "broadcast", event: "pose", payload: pose });
  }

  return { broadcastPose };
}
