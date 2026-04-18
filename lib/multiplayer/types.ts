export type RoomStatus = "waiting" | "active" | "finished";

export interface Room {
  id: string;
  code: string;
  host_id: string;
  status: RoomStatus;
  max_players: number;
  created_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string;
  joined_at: string;
}

export interface PlayerPresence {
  playerId: string;
  name: string;
  onlineAt: string;
}

export interface PlayerState {
  playerId: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facing: "left" | "right";
  action: string;
  health: number;
  timestamp: number;
}

export interface AttackEvent {
  playerId: string;
  attackType: "slash" | "thrust" | "block";
  hitbox: { x: number; y: number; w: number; h: number };
  timestamp: number;
}

export interface HitEvent {
  attackerId: string;
  targetId: string;
  damage: number;
  timestamp: number;
}

export interface GameEvent {
  type: "game_start" | "game_end" | "player_ready";
  payload: Record<string, unknown>;
  timestamp: number;
}

export type BroadcastPayload =
  | { event: "player_state"; payload: PlayerState }
  | { event: "attack"; payload: AttackEvent }
  | { event: "hit"; payload: HitEvent }
  | { event: "game_event"; payload: GameEvent };
