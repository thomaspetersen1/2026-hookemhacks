export type AppPage = "lobby" | "calibrate" | "game" | "results";

export type TimeOfDay = "day" | "sunset" | "night";

export type ThemeIntensity = "subtle" | "normal" | "full";

export type ScoreLevel = "low" | "mid" | "blowout";

export type TweaksState = {
  timeOfDay: TimeOfDay;
  playerCount: number;
  matchPct: number;
  scoreLevel: ScoreLevel;
  intensity: ThemeIntensity;
};
