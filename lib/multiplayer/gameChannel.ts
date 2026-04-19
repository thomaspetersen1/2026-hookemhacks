import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type {
  PlayerState,
  AttackEvent,
  HitEvent,
  GameEvent,
  PlayerPresence,
  PoseSnapshot,
} from "./types";

type PlayerStateHandler = (state: PlayerState) => void;
type AttackHandler = (attack: AttackEvent) => void;
type HitHandler = (hit: HitEvent) => void;
type GameEventHandler = (event: GameEvent) => void;
type PoseSnapshotHandler = (snapshot: PoseSnapshot) => void;
type PresenceHandler = (players: PlayerPresence[]) => void;

export class GameChannel {
  private channel: RealtimeChannel;
  private readonly roomId: string;
  private readonly playerId: string;
  private readonly playerName: string;
  /** Stable join time for this tab — avoids churning presence sort order on every ready toggle. */
  private readonly onlineAt: string;
  private ready = false;

  constructor(roomId: string, playerId: string, playerName: string) {
    this.roomId = roomId;
    this.playerId = playerId;
    this.playerName = playerName;
    this.onlineAt = new Date().toISOString();
    // DEBUG(multiplayer-broadcast-flakiness): logs every channel construction
    // so we can correlate with Fast-Refresh remounts / stale-channel drops.
    // Remove once the broadcast-drops-on-deploy issue is root-caused.
    console.log("[GC] new", { roomId, playerId, playerName });
    this.channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: false, ack: false }, // ack:false = fire-and-forget for lowest latency
        presence: { key: playerId },
      },
    });
  }

  private trackPresence(): Promise<unknown> {
    return this.channel.track({
      playerId: this.playerId,
      name: this.playerName,
      onlineAt: this.onlineAt,
      ready: this.ready,
    });
  }

  async setReady(ready: boolean): Promise<void> {
    this.ready = ready;
    await this.trackPresence();
  }

  subscribe(handlers: {
    onPlayerState?: PlayerStateHandler;
    onAttack?: AttackHandler;
    onHit?: HitHandler;
    onGameEvent?: GameEventHandler;
    onPoseSnapshot?: PoseSnapshotHandler;
    onPresenceChange?: PresenceHandler;
  }): Promise<void> {
    const {
      onPlayerState,
      onAttack,
      onHit,
      onGameEvent,
      onPoseSnapshot,
      onPresenceChange,
    } = handlers;

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

    if (onPoseSnapshot) {
      this.channel.on("broadcast", { event: "pose" }, ({ payload }) =>
        onPoseSnapshot(payload as PoseSnapshot)
      );
    }

    if (onPresenceChange) {
      this.channel.on("presence", { event: "sync" }, () => {
        const state = this.channel.presenceState<PlayerPresence>();
        // Presence stores one array per key (= per player). Multiple entries
        // in the array mean multiple live connections for the same player
        // (dev StrictMode remount, reconnect, two tabs) — collapse to one.
        const players: PlayerPresence[] = [];
        for (const entries of Object.values(state)) {
          if (entries.length === 0) continue;
          // Multiple entries under one key = same player across multiple
          // connections. The player is "ready" if any connection reports ready.
          const anyReady = entries.some((e) => !!e.ready);
          const latest = entries.reduce((a, b) =>
            new Date(a.onlineAt).getTime() >= new Date(b.onlineAt).getTime() ? a : b,
          );
          players.push({
            playerId: latest.playerId,
            name: latest.name,
            onlineAt: latest.onlineAt,
            ready: anyReady,
          });
        }
        onPresenceChange(players);
      });
    }

    return new Promise((resolve, reject) => {
      this.channel.subscribe(async (status, err) => {
        // DEBUG(multiplayer-broadcast-flakiness): logs SUBSCRIBED /
        // CHANNEL_ERROR / TIMED_OUT / CLOSED transitions. When the user
        // reports broadcasts dropping, check here first — a silent CLOSED
        // followed by no reconnect would explain lost messages.
        console.log("[GC] status", status, err ?? "");
        if (status === "SUBSCRIBED") {
          this.ready = false;
          await this.trackPresence();
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

  // Fire-and-forget pose frame. Expect callers to throttle (~15 Hz) — this
  // method itself does not rate-limit.
  broadcastPoseSnapshot(
    snapshot: Omit<PoseSnapshot, "playerId" | "timestamp">,
  ): void {
    const res = this.channel.send({
      type: "broadcast",
      event: "pose",
      payload: {
        ...snapshot,
        playerId: this.playerId,
        timestamp: performance.now(),
      } satisfies PoseSnapshot,
    });
    // DEBUG(multiplayer-broadcast-flakiness): channel.send returns a
    // promise resolving to 'ok' / 'timed out' / 'rate limited'. We log the
    // first 3 sends + every 60th so the console shows whether the sender
    // side is healthy when the receiver reports nothing. `__poseSendCount`
    // is also useful to grep from the live console.
    if (res && typeof (res as Promise<unknown>).then === "function") {
      (res as Promise<unknown>).then((r) => {
        const w = window as unknown as { __poseSendCount?: number };
        w.__poseSendCount = (w.__poseSendCount ?? 0) + 1;
        if (w.__poseSendCount <= 3 || w.__poseSendCount % 60 === 0) {
          console.log("[GC] pose send #", w.__poseSendCount, "result", r);
        }
      }).catch((e) => console.warn("[GC] pose send err", e));
    }
  }

  unsubscribe(): void {
    supabase.removeChannel(this.channel);
  }
}
