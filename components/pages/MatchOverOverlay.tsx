"use client";

type MatchOverOverlayProps = {
  visible: boolean;
  winnerName: string;
  selfWon: boolean;
  onPlayAgain: () => void;
};

export function MatchOverOverlay({
  visible,
  winnerName,
  selfWon,
  onPlayAgain,
}: MatchOverOverlayProps) {
  if (!visible) return null;
  return (
    <div role="status" aria-live="polite">
      <div className="matchover-bg" />
      <div className="matchover-wrap">
        <div className="matchover-card">
          <div className="matchover-hint">Match over</div>
          <div className="matchover-big">{selfWon ? "VICTORY" : "KO"}</div>
          <div className="matchover-name">{winnerName}</div>
          <div className="matchover-sub">wins the round</div>
          <button
            type="button"
            className="matchover-btn"
            onClick={onPlayAgain}
          >
            Play again
          </button>
        </div>
      </div>
      <style>{`
        .matchover-bg {
          position: fixed;
          inset: 0;
          z-index: 10002;
          background: color-mix(in srgb, black 55%, transparent);
          animation: matchover-fade 200ms ease-out both;
        }
        .matchover-wrap {
          position: fixed;
          inset: 0;
          z-index: 10003;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px 24px;
          pointer-events: none;
        }
        .matchover-card {
          pointer-events: auto;
          background: white;
          border: 3px solid var(--sun);
          border-radius: var(--radius-lg);
          box-shadow:
            0 0 0 6px color-mix(in srgb, var(--sun) 22%, transparent),
            var(--shadow-chunky);
          padding: 28px 36px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: min(320px, 88vw);
          max-width: 440px;
          color: var(--ink);
          animation: matchover-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .matchover-hint {
          font-family: var(--font-outfit), sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .matchover-big {
          font-family: var(--font-outfit), sans-serif;
          font-size: clamp(32px, 6.5vw, 52px);
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--sun);
          margin: 4px 0 8px;
          text-shadow:
            0 3px 0 rgba(58, 46, 76, 0.18),
            0 8px 22px color-mix(in srgb, var(--sun) 30%, transparent);
        }
        .matchover-name {
          font-family: var(--font-outfit), sans-serif;
          font-size: clamp(20px, 4vw, 28px);
          font-weight: 700;
          color: var(--ink);
          word-break: break-word;
        }
        .matchover-sub {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-soft);
          margin-bottom: 8px;
        }
        .matchover-btn {
          margin-top: 12px;
          padding: 12px 24px;
          border: none;
          border-radius: var(--radius);
          background: var(--sun);
          color: white;
          font-family: var(--font-outfit), sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: var(--shadow-chunky);
        }
        .matchover-btn:hover  { transform: translateY(-1px); }
        .matchover-btn:active { transform: translateY(1px);  }
        @keyframes matchover-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes matchover-pop {
          0%   { transform: scale(0.4) rotate(-4deg); opacity: 0; }
          60%  { transform: scale(1.06) rotate(2deg); opacity: 1; }
          100% { transform: scale(1)    rotate(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
