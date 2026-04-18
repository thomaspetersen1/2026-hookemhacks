export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Room {
  id: string;
  players: Player[];
  status: "waiting" | "active" | "finished";
}

export interface GameState {
  room: Room;
  localPlayerId: string;
  score: number;
  caloriesBurned: number;
}

export type GestureLabel = "open" | "fist" | "point" | "peace" | "thumbsUp" | "unknown";

export interface ArmState {
  elbowAngle: number;
  swingSpeed: number;
  raisedHeight: number;
  isExtended: boolean;
}

export interface HandState {
  gesture: GestureLabel;
  pinchDistance: number;
}

export interface BodyTrackingState {
  leftArm: ArmState | null;
  rightArm: ArmState | null;
  leftHand: HandState | null;
  rightHand: HandState | null;
  fps: number;
  isReady: boolean;
}

export interface Move {
  swingSpeed: number;
  raisedHeight: number;
  timestamp: number;
}
