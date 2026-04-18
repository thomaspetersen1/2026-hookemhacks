"use client";

import { useState } from "react";

export function useRoom() {
  const [roomId, setRoomId] = useState<string | null>(null);

  async function createRoom() {
    const res = await fetch("/api/rooms", { method: "POST" });
    const data = await res.json();
    setRoomId(data.roomId);
    return data.roomId as string;
  }

  return { roomId, createRoom };
}
