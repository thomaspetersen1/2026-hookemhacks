"use client";

import { useState } from "react";
import { startRecording, stopRecording } from "@/lib/recording";

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);

  function start() {
    startRecording();
    setIsRecording(true);
  }

  function stop() {
    setIsRecording(false);
    return stopRecording();
  }

  return { isRecording, start, stop };
}
