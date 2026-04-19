"use client";

import { useEffect, useRef } from "react";
import { useBodyDetection } from "@/hooks/useBodyDetection";
import { useIngestion } from "@/lib/ingestion/useIngestion";
import { useEventTracker } from "@/lib/ingestion/useEventTracker";

interface Props {
  roomId: string;
  playerId: string;
  combatStarted: boolean;
  /** True once outcome is locked — halts recorder + event flush without
   *  closing the matches row (the winner POST already handled that). */
  frozen?: boolean;
  /** Called when the matches row is created (or cleared on unmount) so the
   *  game page can post the winner to /api/matches/end on game over. */
  onMatchIdChange?: (matchId: string | null) => void;
}

export function IngestionBridge({ roomId, playerId, combatStarted, frozen, onMatchIdChange }: Props) {
  const { videoRef, isReady, leftHandLandmarks, rightHandLandmarks } = useBodyDetection();
  const tracker = useEventTracker();
  const calibratedRef = useRef(false);

  const stream = isReady
    ? ((videoRef?.current?.srcObject as MediaStream | null) ?? null)
    : null;

  // Auto-calibrate once on the first frame both hands are visible.
  // Assumes the player starts with their guard up (natural boxing stance).
  useEffect(() => {
    if (calibratedRef.current) return;
    if (!leftHandLandmarks && !rightHandLandmarks) return;
    tracker.calibrate(leftHandLandmarks, rightHandLandmarks);
    calibratedRef.current = true;
  }, [leftHandLandmarks, rightHandLandmarks, tracker]);

  // Per-frame punch detection.
  useEffect(() => {
    tracker.detect(leftHandLandmarks, rightHandLandmarks);
  }, [leftHandLandmarks, rightHandLandmarks, tracker]);

  const { matchId } = useIngestion({
    roomId,
    playerId,
    stream,
    enabled: combatStarted,
    frozen,
    drainEvents: tracker.drainEvents,
    getChunkRollup: tracker.rollChunk,
  });

  useEffect(() => {
    onMatchIdChange?.(matchId);
    return () => onMatchIdChange?.(null);
  }, [matchId, onMatchIdChange]);

  return null;
}
