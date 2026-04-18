"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { HumanoidBoneName, PlayerId } from "@/types";
import { usePoseStore } from "@/lib/store/poseStore";
import { applyRigRotations, type AvatarBones } from "@/lib/rigging";

const SHOULDER_HALF = 0.18;
const UPPER_ARM_LEN = 0.3;
const LOWER_ARM_LEN = 0.28;
const ROD_R = 0.025;
const SHOULDER_R = 0.03;

const COLOR_SHOULDER = "#9ca3af";
const COLOR_LEFT_UPPER = "#ef4444";
const COLOR_LEFT_LOWER = "#f97316";
const COLOR_RIGHT_UPPER = "#3b82f6";
const COLOR_RIGHT_LOWER = "#22d3ee";

interface RodAvatarProps {
  playerId: PlayerId;
  position?: [number, number, number];
}

export function RodAvatar({ playerId, position = [0, 1.2, 0] }: RodAvatarProps) {
  const bones = useRef<AvatarBones>({});

  const bind = useMemo(() => {
    const cache: Partial<Record<HumanoidBoneName, (el: Group | null) => void>> = {};
    return (name: HumanoidBoneName) => {
      let cb = cache[name];
      if (!cb) {
        cb = (el: Group | null) => {
          if (el) bones.current[name] = el;
          else delete bones.current[name];
        };
        cache[name] = cb;
      }
      return cb;
    };
  }, []);

  useFrame(() => {
    const pose = usePoseStore.getState().players[playerId];
    const rig = pose?.rig;
    if (rig?.pose && Object.keys(rig.pose).length > 0) {
      applyRigRotations(bones.current, rig);
    }
  });

  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[SHOULDER_R, SHOULDER_R, SHOULDER_HALF * 2, 12]} />
        <meshStandardMaterial color={COLOR_SHOULDER} />
      </mesh>

      <group ref={bind("LeftUpperArm")} position={[-SHOULDER_HALF, 0, 0]}>
        <mesh position={[0, -UPPER_ARM_LEN / 2, 0]}>
          <cylinderGeometry args={[ROD_R, ROD_R, UPPER_ARM_LEN, 12]} />
          <meshStandardMaterial color={COLOR_RIGHT_UPPER} />
        </mesh>
        <group ref={bind("LeftLowerArm")} position={[0, -UPPER_ARM_LEN, 0]}>
          <mesh position={[0, -LOWER_ARM_LEN / 2, 0]}>
            <cylinderGeometry args={[ROD_R, ROD_R, LOWER_ARM_LEN, 12]} />
            <meshStandardMaterial color={COLOR_RIGHT_LOWER} />
          </mesh>
        </group>
      </group>

      <group ref={bind("RightUpperArm")} position={[SHOULDER_HALF, 0, 0]}>
        <mesh position={[0, -UPPER_ARM_LEN / 2, 0]}>
          <cylinderGeometry args={[ROD_R, ROD_R, UPPER_ARM_LEN, 12]} />
          <meshStandardMaterial color={COLOR_LEFT_UPPER} />
        </mesh>
        <group ref={bind("RightLowerArm")} position={[0, -UPPER_ARM_LEN, 0]}>
          <mesh position={[0, -LOWER_ARM_LEN / 2, 0]}>
            <cylinderGeometry args={[ROD_R, ROD_R, LOWER_ARM_LEN, 12]} />
            <meshStandardMaterial color={COLOR_LEFT_LOWER} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
