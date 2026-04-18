"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { HumanoidBoneName } from "@/types";
import { SELF_PLAYER_ID } from "@/types";
import { usePoseStore } from "@/lib/store/poseStore";
import { applyRigRotations, type AvatarBones } from "@/lib/rigging";
import { useBodyDetection } from "@/hooks/useBodyDetection";

const COLLAR_W = 0.72;
const COLLAR_H = 0.05;
const UPPER_ARM_LEN = 0.30;
const LOWER_ARM_LEN = 0.28;
const ARM_W = 0.10;
const FORE_W = 0.085;

const LEFT_COLOR  = "#2BB3C0";
const RIGHT_COLOR = "#FF6B4A";

// The only bones CVRigBridge/armStateToRigRotations will write to.
// CollarBar is a plain static mesh — not registered in the bone map.
const ARM_BONES: HumanoidBoneName[] = [
  "LeftUpperArm", "LeftLowerArm",
  "RightUpperArm", "RightLowerArm",
];

export function ArmRig() {
  const bones = useRef<AvatarBones>({});
  const { leftArm, rightArm } = useBodyDetection();
  const logTimer = useRef(0);

  const bind = useMemo(() => {
    const cache: Partial<Record<HumanoidBoneName, (el: Group | null) => void>> = {};
    return (name: HumanoidBoneName) => {
      if (!cache[name]) {
        cache[name] = (el: Group | null) => {
          if (el) bones.current[name] = el;
          else delete bones.current[name];
        };
      }
      return cache[name]!;
    };
  }, []);

  useFrame((_, delta) => {
    const rig = usePoseStore.getState().players[SELF_PLAYER_ID]?.rig;
    if (!rig) return;
    applyRigRotations(bones.current, rig, 0.7);

    logTimer.current += delta;
    if (logTimer.current >= 1) {
      logTimer.current = 0;
      const fmt = (arm: typeof leftArm, label: string) => {
        if (!arm) return `${label}: not detected`;
        const dir = arm.isExtended ? "FORWARD (biased)" : arm.forwardAngle > 0 ? "forward" : "backward";
        return `${label}: ${dir}  fwdAngle=${arm.forwardAngle.toFixed(2)}rad  extended=${arm.isExtended}`;
      };
      console.log(fmt(leftArm, "L"), "|", fmt(rightArm, "R"));
    }
  });

  return (
    // Root pivot — floats at a comfortable viewing height
    <group position={[0, 0.4, 0]}>

      {/* ── Collar bar ─────────────────────────────────────────────────── */}
      <mesh>
        <boxGeometry args={[COLLAR_W, COLLAR_H, COLLAR_H]} />
        <meshBasicMaterial color="#4a6274" />
      </mesh>

      {/* ── Left arm chain ─────────────────────────────────────────────── */}
      {/* LeftUpperArm pivot sits at the left end of the collar bar */}
      <group
        ref={bind("LeftUpperArm")}
        position={[-COLLAR_W / 2, 0, 0]}
      >
        <mesh position={[0, -UPPER_ARM_LEN / 2, 0]}>
          <boxGeometry args={[ARM_W, UPPER_ARM_LEN, ARM_W]} />
          <meshBasicMaterial color={LEFT_COLOR} />
        </mesh>

        <group ref={bind("LeftLowerArm")} position={[0, -UPPER_ARM_LEN, 0]}>
          <mesh position={[0, -LOWER_ARM_LEN / 2, 0]}>
            <boxGeometry args={[FORE_W, LOWER_ARM_LEN, FORE_W]} />
            <meshBasicMaterial color="#7ee8ef" />
          </mesh>
        </group>
      </group>

      {/* ── Right arm chain ────────────────────────────────────────────── */}
      <group ref={bind("RightUpperArm")} position={[COLLAR_W / 2, 0, 0]}>
        <mesh position={[0, -UPPER_ARM_LEN / 2, 0]}>
          <boxGeometry args={[ARM_W, UPPER_ARM_LEN, ARM_W]} />
          <meshBasicMaterial color={RIGHT_COLOR} />
        </mesh>

        <group ref={bind("RightLowerArm")} position={[0, -UPPER_ARM_LEN, 0]}>
          <mesh position={[0, -LOWER_ARM_LEN / 2, 0]}>
            <boxGeometry args={[FORE_W, LOWER_ARM_LEN, FORE_W]} />
            <meshBasicMaterial color="#ffaa88" />
          </mesh>
        </group>
      </group>

    </group>
  );
}

// Bone name list exported so tests / debug tooling can reference it
export { ARM_BONES };
