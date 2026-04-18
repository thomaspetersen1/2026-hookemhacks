"use client";

import { useGameStore } from "@/lib/store/gameStore";
import type { Player, Sport } from "@/types";

const SPORT_LABELS: Record<Sport, string> = {
  swords: "Swords",
  tennis: "Ping Pong",
  golf: "Golf",
};

export function ScoreHUD() {
  const { sport, phase, players, setSport, setPhase, reset, setPlayerConnected } =
    useGameStore();

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-6 font-mono text-zinc-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>

        <div className="rounded-lg border border-zinc-700/60 bg-black/50 px-4 py-3 backdrop-blur">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            Sport
          </div>
          <div className="text-lg font-semibold text-cyan-300">
            {SPORT_LABELS[sport]}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-center gap-3">
        <div className="pointer-events-auto flex gap-2 rounded-full border border-zinc-700/60 bg-black/50 p-1 backdrop-blur">
          {(Object.keys(SPORT_LABELS) as Sport[]).map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                s === sport
                  ? "bg-orange-500 text-black"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {SPORT_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="pointer-events-auto flex gap-2 rounded-full border border-zinc-700/60 bg-black/50 p-1 backdrop-blur">
          <button
            onClick={() =>
              setPhase(phase === "playing" ? "paused" : "playing")
            }
            className="rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-black hover:bg-cyan-400"
          >
            {phase === "playing" ? "Pause" : "Start"}
          </button>
          <button
            onClick={reset}
            className="rounded-full px-4 py-1.5 text-xs uppercase tracking-wider text-zinc-300 hover:bg-zinc-800"
          >
            Reset
          </button>
        </div>

        {/* Dev helper — toggles the remote player's connected flag so you can
            eyeball the 2-player HUD/avatar state before Track 3 wires Realtime. */}
        <div className="pointer-events-auto flex gap-2 rounded-full border border-zinc-700/60 bg-black/50 p-1 backdrop-blur">
          {players
            .filter((p) => !p.isLocal)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => setPlayerConnected(p.id, !p.isConnected)}
                className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
                  p.isConnected
                    ? "bg-emerald-500/80 text-black"
                    : "text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {p.displayName} {p.isConnected ? "online" : "offline"}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <div
      className="rounded-lg border px-4 py-3 backdrop-blur"
      style={{
        borderColor: player.isConnected
          ? `${player.tint}88`
          : "rgb(63 63 70 / 0.6)",
        background: "rgba(0,0,0,0.5)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: player.isConnected ? player.tint : "#52525b",
            boxShadow: player.isConnected ? `0 0 8px ${player.tint}` : undefined,
          }}
        />
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          {player.displayName}
        </span>
      </div>
      <div
        className="text-3xl font-bold tabular-nums"
        style={{ color: player.isConnected ? player.tint : "#71717a" }}
      >
        {player.score.toString().padStart(3, "0")}
      </div>
    </div>
  );
}
