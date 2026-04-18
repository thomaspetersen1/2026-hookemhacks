"use client";

import { useEffect } from "react";
import { useBodyDetection } from "@/hooks/useBodyDetection";
import { usePoseStore } from "@/lib/store/poseStore";
import {
  armStateToRigRotations,
  handLandmarksToFingerRig,
} from "@/lib/rigging";
import type { PlayerId, RigRotations } from "@/types";

/**
 * Reads BodyTrackingState from teammate's useBodyDetection context and pushes
 * the derived rig into the pose store under `playerId`. The Avatar's useFrame
 * is already subscribed to `usePoseStore.getState().players[playerId].rig` and
 * applies it automatically — so mounting this bridge is the entire integration.
 *
 * Combines two CV sources:
 *   - arm state (shoulder/elbow/wrist)  → upper arm + forearm rotations
 *   - hand landmarks (21 per hand)      → per-finger joint rotations
 *
 * Renders nothing.
 */
export function CVRigBridge({ playerId }: { playerId: PlayerId }) {
  const {
    leftArm,
    rightArm,
    leftHandLandmarks,
    rightHandLandmarks,
    isReady,
  } = useBodyDetection();

  useEffect(() => {
    if (!isReady) return;

    // Direct pass-through: ArmState.leftArm → avatar's LeftUpperArm.
    // Turns out teammate's useBodyDetection names the fields from the
    // user's perspective already (not mirrored), so same-side is the
    // natural mapping for third-person (user and avatar face same way).
    const armRig = armStateToRigRotations(leftArm, rightArm);
    const leftFingers = handLandmarksToFingerRig("Left", leftHandLandmarks);
    const rightFingers = handLandmarksToFingerRig("Right", rightHandLandmarks);

    const rig: RigRotations = {
      pose: {
        ...armRig.pose,
        ...leftFingers,
        ...rightFingers,
      },
    };

    usePoseStore.getState().setRig(playerId, rig);
  }, [leftArm, rightArm, leftHandLandmarks, rightHandLandmarks, isReady, playerId]);

  return null;
}
