"use client";

import { useEffect, useState } from "react";
import { FigureSilhouette } from "../scenery/Scenery";
import type { ScoreLevel } from "../shared/types";

const GAME_PLAYERS = [
  { name: "You", tag: "P1", you: true },
  { name: "Mango Molly", tag: "P2", you: false },
  { name: "Coral Kai", tag: "P3", you: false },
  { name: "Lavafoot", tag: "P4", you: false },
  { name: "Reef Rae", tag: "P5", you: false },
  { name: "Sunny Steve", tag: "P6", you: false },
  { name: "Palm Pete", tag: "P7", you: false },
  { name: "Tiki Tomi", tag: "P8", you: false },
] as const;

const GAME_COLORS = [
  "#FF6B4A",
  "#2BB3C0",
  "#2E7D5B",
  "#FF5E7E",
  "#FFD24A",
  "#8A5EE0",
  "#4A90E2",
  "#E06B4A",
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

type GameScreenProps = {
  onPause?: () => void;
  onEnd?: () => void;
  playerCount?: number;
  scoreLevel?: ScoreLevel;
};

export function GameScreen({ onPause, onEnd, playerCount = 4, scoreLevel = "mid" }: GameScreenProps) {
  const [paused, setPaused] = useState(false);
  const [emoteOpen, setEmoteOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(92);
  const [combo] = useState(7);
  const [health, setHealth] = useState(78);
  const [stamina, setStamina] = useState(54);

  const scoreMult = scoreLevel === "blowout" ? 1.8 : scoreLevel === "low" ? 0.35 : 1;
  const players = GAME_PLAYERS.slice(0, playerCount)
    .map((p, i) => {
      const baseScores = [2840, 2610, 2390, 2050, 1780, 1510, 1220, 980];
      return {
        ...p,
        color: GAME_COLORS[i % GAME_COLORS.length],
        score: Math.round(baseScores[i] * scoreMult),
        delta: i === 0 ? "+120" : i === 1 ? "+90" : i === 2 ? "+70" : "+40",
      };
    })
    .sort((a, b) => b.score - a.score);

  useEffect(() => {
    if (paused || emoteOpen) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [paused, emoteOpen]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setStamina((s) => Math.min(100, s + 1)), 500);
    return () => clearInterval(id);
  }, [paused]);

  const openPause = () => {
    setPaused(true);
    onPause?.();
  };
  const resume = () => setPaused(false);

  const emotes = [
    { emoji: "🌺", label: "Aloha", angle: -90 },
    { emoji: "🔥", label: "Hot!", angle: -36 },
    { emoji: "🌊", label: "Smooth", angle: 18 },
    { emoji: "🥥", label: "GG", angle: 72 },
    { emoji: "⚡", label: "Fast", angle: 126 },
    { emoji: "🙈", label: "Oof", angle: 180 },
  ];

  return (
    <div className="game-wrap">
      <div className="game-topbar">
        <div className="scoreboard">
          {players.map((p, i) => (
            <div key={p.tag} className={`score-tile ${p.you ? "you" : ""} ${i === 0 ? "leader" : ""}`}>
              <div className="avatar" style={{ background: p.color }}>
                {p.name[0]}
              </div>
              <div>
                <div className="s-name">{p.name}</div>
                <div className="s-meta mono">
                  {p.tag} · {p.delta}
                </div>
              </div>
              <div className="s-pts">{p.score.toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="timer-card">
          <div className="timer-label">Match time</div>
          <div className={`timer-val ${timeLeft <= 10 ? "low" : ""}`}>{formatTime(timeLeft)}</div>
        </div>
        <button type="button" className="icon-btn" title="Pause" onClick={openPause}>
          II
        </button>
      </div>

      <div className="game-field">
        <div className="game-view">
          <div className="webcam-fake">
            <div className="fake-sun" />
            <div className="fake-volcano" />
            <div className="fake-sand" />
            <div className="fake-palm" />
          </div>
          <div className="figure">
            <FigureSilhouette />
          </div>

          <div className="combo-badge">
            <span>COMBO</span>
            <span className="x">×</span>
            <span>{combo}</span>
          </div>

          <div className="target" style={{ top: "22%", left: "18%" }}>
            +50
          </div>
          <div className="target t2" style={{ top: "34%", right: "22%" }}>
            +30
          </div>
          <div className="target t3" style={{ top: "58%", left: "66%" }}>
            +40
          </div>

          <div className="cal-overlay">
            <div className="corner tl" />
            <div className="corner tr" />
            <div className="corner bl" />
            <div className="corner br" />
          </div>
        </div>

        <div className="hud-side">
          <div className="hud-card">
            <div className="bar-label">
              <span>❤ Health</span>
              <span className="mono">
                {health}/100
              </span>
            </div>
            <div className="bar">
              <div className={`bar-fill ${health < 30 ? "low" : ""}`} style={{ width: `${health}%` }} />
            </div>

            <div className="bar-label" style={{ marginTop: 12 }}>
              <span>⚡ Stamina</span>
              <span className="mono">{stamina}/100</span>
            </div>
            <div className="bar">
              <div className="bar-fill stamina" style={{ width: `${stamina}%` }} />
            </div>
          </div>

          <div className="hud-card">
            <div className="hud-title">
              <span>Power-ups</span>
              <span className="pct-val">3 READY</span>
            </div>
            <div className="powerups">
              <div className="powerup available">
                🌋<span className="kb">Q</span>
              </div>
              <div className="powerup available chill">
                ❄<span className="kb">W</span>
              </div>
              <div className="powerup available leaf">
                🌿<span className="kb">E</span>
              </div>
              <div className="powerup empty">
                —<span className="kb">R</span>
              </div>
              <div className="powerup empty">
                —<span className="kb">T</span>
              </div>
              <div className="powerup empty">
                —<span className="kb">Y</span>
              </div>
            </div>
          </div>

          <button type="button" className="emote-btn" onClick={() => setEmoteOpen(true)}>
            💬 Emote wheel{" "}
            <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>
              [TAB]
            </span>
          </button>
        </div>
      </div>

      {emoteOpen && (
        <div className="emote-wheel" onClick={() => setEmoteOpen(false)} role="presentation">
          <div className="center" onClick={(e) => e.stopPropagation()} role="presentation">
            <div className="hub">
              <div>
                <span className="small">PICK ONE</span>
                <span className="big">Emote</span>
              </div>
            </div>
            {emotes.map((em, i) => {
              const rad = (em.angle * Math.PI) / 180;
              const cx = 160 + Math.cos(rad) * 110;
              const cy = 160 + Math.sin(rad) * 110;
              return (
                <div
                  key={i}
                  className="emote-slot"
                  style={{ left: cx, top: cy }}
                  onClick={() => setEmoteOpen(false)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setEmoteOpen(false);
                  }}
                >
                  {em.emoji}
                  <div className="label">{em.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {paused && (
        <div className="pause-overlay" onClick={resume} role="presentation">
          <div className="pause-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="pause-eyebrow">Match paused</div>
            <h2 className="pause-title">Catch your breath.</h2>
            <p className="pause-sub">The lobby&apos;s still here. Your score is safe.</p>

            <div className="pause-mini-stats">
              <div className="pause-stat">
                <div className="val">{players[0].score.toLocaleString()}</div>
                <div className="lbl">Your points</div>
              </div>
              <div className="pause-stat">
                <div className="val">×{combo}</div>
                <div className="lbl">Combo</div>
              </div>
              <div className="pause-stat">
                <div className="val">{formatTime(timeLeft)}</div>
                <div className="lbl">Left</div>
              </div>
            </div>

            <div className="pause-actions">
              <button type="button" className="btn primary full" onClick={resume}>
                ▶ Resume
              </button>
              <button type="button" className="btn ghost full">
                ⚙ Settings
              </button>
              <button
                type="button"
                className="btn ghost full"
                onClick={() => {
                  setPaused(false);
                  onEnd?.();
                }}
              >
                🏁 End match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
