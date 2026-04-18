"use client";

import type { ScoreLevel, ThemeIntensity, TimeOfDay, TweaksState } from "../shared/types";

type TweaksProps = {
  values: TweaksState;
  onChange: (next: TweaksState) => void;
  visible: boolean;
  onClose: () => void;
};

export function Tweaks({ values, onChange, visible, onClose }: TweaksProps) {
  if (!visible) return null;

  const set = <K extends keyof TweaksState>(k: K, v: TweaksState[K]) => onChange({ ...values, [k]: v });

  const timeOptions: TimeOfDay[] = ["day", "sunset", "night"];
  const intensityOptions: ThemeIntensity[] = ["subtle", "normal", "full"];
  const scoreOptions: ScoreLevel[] = ["low", "mid", "blowout"];

  return (
    <div className="tweaks-panel">
      <div className="tweaks-head">
        <span className="t">Tweaks</span>
        <button type="button" className="tweaks-close" onClick={onClose} aria-label="Close tweaks">
          ×
        </button>
      </div>
      <div className="tweaks-body">
        <div className="tweak-group">
          <label>Time of day</label>
          <div className="tweak-seg">
            {timeOptions.map((t) => (
              <button key={t} type="button" className={values.timeOfDay === t ? "on" : ""} onClick={() => set("timeOfDay", t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="tweak-group">
          <label>Theme intensity</label>
          <div className="tweak-seg">
            {intensityOptions.map((t) => (
              <button
                key={t}
                type="button"
                className={values.intensity === t ? "on" : ""}
                onClick={() => set("intensity", t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="tweak-group">
          <label>
            Players in lobby <span className="tweak-val">{values.playerCount}</span>
          </label>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            className="tweak-slider"
            value={values.playerCount}
            onChange={(e) => set("playerCount", parseInt(e.target.value, 10))}
          />
        </div>
        <div className="tweak-group">
          <label>
            Calibration match % <span className="tweak-val">{values.matchPct}</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            className="tweak-slider"
            value={values.matchPct}
            onChange={(e) => set("matchPct", parseInt(e.target.value, 10))}
          />
        </div>
        <div className="tweak-group">
          <label>Game score state</label>
          <div className="tweak-seg">
            {scoreOptions.map((t) => (
              <button
                key={t}
                type="button"
                className={values.scoreLevel === t ? "on" : ""}
                onClick={() => set("scoreLevel", t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
