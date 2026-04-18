import { supabase } from "./client";

export function subscribeToRoom(roomId: string, onPayload: (payload: unknown) => void) {
  return supabase
    .channel(`room:${roomId}`)
    .on("broadcast", { event: "pose" }, onPayload)
    .subscribe();
}
