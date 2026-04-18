import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type {
  PlayerState,
  AttackEvent,
  HitEvent,
  GameEvent,
  PlayerPresence,
} from "./types";

type PlayerStateHandler = (state: PlayerState) => void;
type AttackHandler = (attack: AttackEvent) => void;
type HitHandler = (hit: HitEvent) => void;
type GameEventHandler = (event: GameEvent) => void;
type PresenceHandler = (players: PlayerPresence[]) => void;

export class GameChannel {
  private channel: RealtimeChannel;
  private readonly roomId: string;
  private readonly playerId: string;
  private readonly playerName: string;

  constructor(roomId: string, playerId: string, playerName: string) {
    this.roomId = roomId;
    this.playerId = playerId;
    this.playerName = playerName;
    this.channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: false, ack: false }, // ack:false = fire-and-forget for lowest latency
        presence: { key: playerId },
      },
    });
  }

  subscribe(handlers: {
    onPlayerState?: PlayerStateHandler;
    onAttack?: AttackHandler;
    onHit?: HitHandler;
    onGameEvent?: GameEventHandler;
    onPresenceChange?: PresenceHandler;
  }): Promise<void> {
    const { onPlayerState, onAttack, onHit, onGameEvent, onPresenceChange } =
      handlers;

    if (onPlayerState) {
      this.channel.on("broadcast", { event: "player_state" }, ({ payload }) =>
        onPlayerState(payload as PlayerState)
      );
    }

    if (onAttack) {
      this.channel.on("broadcast", { event: "attack" }, ({ payload }) =>
        onAttack(payload as AttackEvent)
      );
    }

    if (onHit) {
      this.channel.on("broadcast", { event: "hit" }, ({ payload }) =>
        onHit(payload as HitEvent)
      );
    }

    if (onGameEvent) {
      this.channel.on("broadcast", { event: "game_event" }, ({ payload }) =>
        onGameEvent(payload as GameEvent)
      );
    }

    if (onPresenceChange) {
      this.channel.on("presence", { event: "sync" }, () => {
        const state = this.channel.presenceState<PlayerPresence>();
        const players = Object.values(state).flat();
        onPresenceChange(players);
      });
    }

    return new Promise((resolve, reject) => {
      this.channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await this.channel.track({
            playerId: this.playerId,
            name: this.playerName,
            onlineAt: new Date().toISOString(),
          });
          resolve();
        } else if (status === "CHANNEL_ERROR") {
          reject(new Error("Failed to connect to game channel"));
        }
      });
    });
  }

  broadcastPlayerState(state: Omit<PlayerState, "playerId" | "timestamp">): void {
    this.channel.send({
      type: "broadcast",
      event: "player_state",
      payload: {
        ...state,
        playerId: this.playerId,
        timestamp: performance.now(),
      } satisfies PlayerState,
    });
  }

  broadcastAttack(attack: Omit<AttackEvent, "playerId" | "timestamp">): void {
    this.channel.send({
      type: "broadcast",
      event: "attack",
      payload: {
        ...attack,
        playerId: this.playerId,
        timestamp: performance.now(),
      } satisfies AttackEvent,
    });
  }

  broadcastHit(hit: Omit<HitEvent, "timestamp">): void {
    this.channel.send({
      type: "broadcast",
      event: "hit",
      payload: {
        ...hit,
        timestamp: performance.now(),
      } satisfies HitEvent,
    });
  }

  broadcastGameEvent(event: Omit<GameEvent, "timestamp">): void {
    this.channel.send({
      type: "broadcast",
      event: "game_event",
      payload: {
        ...event,
        timestamp: performance.now(),
      } satisfies GameEvent,
    });
  }

  unsubscribe(): void {
    supabase.removeChannel(this.channel);
  }
}
