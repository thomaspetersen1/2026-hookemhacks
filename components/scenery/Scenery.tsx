import type { AppPage } from "../shared/types";
import { BRAND } from "../shared/constants";

export function Backdrop() {
  return (
    <div className="backdrop">
      <div className="sky" />
      <div className="stars" />
      <div className="sun-disc" />
      <div className="clouds">
        <div
          className="cloud"
          style={{ width: 180, height: 40, top: "14%", animationDuration: "80s" }}
        />
        <div
          className="cloud"
          style={{
            width: 120,
            height: 28,
            top: "22%",
            animationDuration: "100s",
            animationDelay: "-40s",
          }}
        />
        <div
          className="cloud"
          style={{
            width: 220,
            height: 44,
            top: "8%",
            animationDuration: "120s",
            animationDelay: "-20s",
          }}
        />
      </div>
      <div className="volcano back" />
      <div className="volcano small" />
      <div className="ocean-layer">
        <div className="wave" style={{ top: 10, animation: "drift 14s linear infinite" }} />
        <div
          className="wave"
          style={{ top: 40, animation: "drift 18s linear infinite reverse" }}
        />
      </div>
      <div className="sand-strip" />
      <div className="volcano">
        <div className="lava-glow" />
        <div className="smoke" />
      </div>
      <div className="palm left">
        <div className="fronds">
          <div className="frond" />
          <div className="frond" />
          <div className="frond" />
          <div className="frond" />
          <div className="frond" />
          <div className="frond" />
        </div>
      </div>
      <div className="palm right">
        <div className="fronds">
          <div className="frond" />
          <div className="frond" />
          <div className="frond" />
          <div className="frond" />
          <div className="frond" />
          <div className="frond" />
        </div>
      </div>
    </div>
  );
}

export function FigureSilhouette() {
  return (
    <svg viewBox="0 0 160 360" fill="none">
      <defs>
        <linearGradient id="figGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A2E4C" />
          <stop offset="1" stopColor="#1E1530" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="48" r="26" fill="url(#figGrad)" />
      <rect x="72" y="72" width="16" height="12" fill="url(#figGrad)" />
      <path
        d="M50 86 Q52 84 80 84 Q108 84 110 86 L118 190 Q118 198 110 198 L50 198 Q42 198 42 190 Z"
        fill="url(#figGrad)"
      />
      <path d="M50 88 L30 180 L42 184 L60 94 Z" fill="url(#figGrad)" />
      <path d="M110 88 L130 180 L118 184 L100 94 Z" fill="url(#figGrad)" />
      <circle cx="34" cy="184" r="9" fill="url(#figGrad)" />
      <circle cx="126" cy="184" r="9" fill="url(#figGrad)" />
      <path d="M56 198 L52 340 L72 340 L78 200 Z" fill="url(#figGrad)" />
      <path d="M104 198 L108 340 L88 340 L82 200 Z" fill="url(#figGrad)" />
      <ellipse cx="62" cy="344" rx="14" ry="6" fill="url(#figGrad)" />
      <ellipse cx="98" cy="344" rx="14" ry="6" fill="url(#figGrad)" />
    </svg>
  );
}

type SparkleProps = {
  size?: number;
  color?: string;
};

export function Sparkle({ size = 14, color = "var(--glow)" }: SparkleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill={color} />
    </svg>
  );
}

type TopBarProps = {
  current: AppPage;
  onNav: (page: AppPage) => void;
};

export function TopBar({ current, onNav }: TopBarProps) {
  const items: { key: AppPage; label: string }[] = [
    { key: "lobby", label: "Lobby" },
    { key: "calibrate", label: "Calibrate" },
    { key: "game", label: "Play" },
    { key: "results", label: "Results" },
  ];

  return (
    <div className="topbar">
      <div className="logo">
        <div className="logo-mark" />
        <span>{BRAND.gameName}</span>
      </div>
      <div className="nav-pills">
        {items.map((it, i) => (
          <button
            key={it.key}
            type="button"
            className={`nav-pill ${current === it.key ? "active" : ""}`}
            onClick={() => onNav(it.key)}
          >
            <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>
              0{i + 1}
            </span>
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
