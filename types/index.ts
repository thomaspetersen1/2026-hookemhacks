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
