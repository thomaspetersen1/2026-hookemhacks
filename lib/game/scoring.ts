import type { Move, PunchEvent } from "@/types";

const SWING_THRESHOLD = 0.15;
const MET_CONSTANT = 0.005; // rough calories per score unit

export function calculateScore(moves: Move[]): { score: number; caloriesBurned: number } {
  const score = moves.reduce((acc, move) => {
    if (move.punchEvent) return acc + move.punchEvent.enlargementRatio;
    if (move.swingSpeed < SWING_THRESHOLD) return acc;
    return acc + move.swingSpeed * (1 + move.raisedHeight * 0.5);
  }, 0);

  return {
    score: Math.round(score * 100),
    caloriesBurned: Math.round(score * MET_CONSTANT * 100) / 100,
  };
}

export function calculateScoreFromPunches(punches: PunchEvent[]): { score: number; caloriesBurned: number } {
  const score = punches.reduce((acc, p) => acc + p.enlargementRatio, 0);
  return {
    score: Math.round(score * 100),
    caloriesBurned: Math.round(score * MET_CONSTANT * 100) / 100,
  };
}
