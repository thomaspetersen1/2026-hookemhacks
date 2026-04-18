"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Backdrop } from "@/components/scenery/Scenery";
import { BRAND } from "@/components/shared/constants";

const WORDS = ["SURF", "LAVA", "PALM", "REEF", "MANA", "TIDE", "DUSK", "KAMI", "HULA", "KONA"];

function generateCode(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export default function CreatePage() {
  const router = useRouter();
  const [code] = useState(() => generateCode());
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const openLobby = () => {
    if (!name.trim()) return;
    router.push(`/lobby/${code}`);
  };

  return (
    <div className="app-stage" data-time="day" data-intensity="normal">
      <Backdrop />

      <div className="topbar">
        <Link href="/" className="logo" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
          <div className="logo-mark" />
          <span>{BRAND.gameName}</span>
        </Link>
        <div className="nav-pills">
          <div className="nav-pill active">
            <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>01</span>
            Create
          </div>
          <div className="nav-pill" style={{ opacity: 0.45 }}>
            <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>02</span>
            Lobby
          </div>
          <div className="nav-pill" style={{ opacity: 0.45 }}>
            <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>03</span>
            Play
          </div>
        </div>
      </div>

      <div className="hj-wrap" style={{ paddingTop: "80px" }}>
        <div className="hj-card card">
          <div className="hj-eyebrow">{BRAND.event} · Create a room</div>
          <h1 className="hj-title">Build a cove.</h1>
          <p className="hj-sub">
            Share this four-letter word with your crew. They&apos;ll use it to join.
          </p>

          <div className="room-code-label">Your room word</div>
          <div className="room-code">
            {code.split("").map((c, i) => (
              <div key={i} className="code-digit">{c}</div>
            ))}
          </div>
          <div className="copy-row">
            <span>Share this with friends</span>
            <button type="button" className={`copy-btn ${copied ? "copied" : ""}`} onClick={copyCode}>
              {copied ? "✓ COPIED" : "COPY CODE"}
            </button>
          </div>

          <div className="name-row" style={{ marginTop: 24 }}>
            <label htmlFor="host-name">Your player name</label>
            <input
              id="host-name"
              className="name-input"
              placeholder="e.g. Lava Larry"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && openLobby()}
              autoFocus
            />
          </div>

          <div className="action-row" style={{ marginTop: 24 }}>
            <Link href="/" className="btn ghost" style={{ flex: "0 0 auto", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ← Back
            </Link>
            <button
              type="button"
              className="btn primary"
              style={{ flex: 1, opacity: name.trim() ? 1 : 0.5 }}
              disabled={!name.trim()}
              onClick={openLobby}
            >
              Open lobby →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
