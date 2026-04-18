import * as THREE from "three";
import type { ArmState } from "@/types";

export interface BoneRotations {
  leftUpperArm: THREE.Euler;
  leftForearm: THREE.Euler;
  rightUpperArm: THREE.Euler;
  rightForearm: THREE.Euler;
}

export function armStateToBoneRotations(left: ArmState | null, right: ArmState | null): BoneRotations {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const leftUpperArm = left
    ? new THREE.Euler(0, 0, -toRad(left.raisedHeight * 90))
    : new THREE.Euler();
  const leftForearm = left
    ? new THREE.Euler(0, 0, -toRad(180 - left.elbowAngle))
    : new THREE.Euler();

  const rightUpperArm = right
    ? new THREE.Euler(0, 0, toRad(right.raisedHeight * 90))
    : new THREE.Euler();
  const rightForearm = right
    ? new THREE.Euler(0, 0, toRad(180 - right.elbowAngle))
    : new THREE.Euler();

  return { leftUpperArm, leftForearm, rightUpperArm, rightForearm };
}

/** @deprecated use armStateToBoneRotations */
export function landmarksToBoneRotations(_landmarks: unknown[]): Record<string, never> {
  return {};
}
