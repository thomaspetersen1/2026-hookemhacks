"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Backdrop } from "@/components/scenery/Scenery";
import { BRAND } from "@/components/shared/constants";

const RECENT = [
  { emoji: "🌊", code: "SURF" },
  { emoji: "🌋", code: "LAVA" },
  { emoji: "🌴", code: "PALM" },
];

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefill = searchParams.get("code")?.toUpperCase().slice(0, 4) ?? "";

  const [inputCode, setInputCode] = useState<string[]>(
    prefill ? prefill.split("").concat(Array(4 - prefill.length).fill("")) : ["", "", "", ""]
  );
  const [name, setName] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    const v = val.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    const next = [...inputCode];
    next[idx] = v;
    setInputCode(next);
    if (v && idx < 3) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputCode[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const setQuickCode = (code: string) => setInputCode(code.split(""));

  const filled = inputCode.every((c) => c);
  const codeStr = inputCode.join("");

  const joinRoom = () => {
    if (!filled || !name.trim()) return;
    router.push(`/lobby/${codeStr}`);
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
            Join
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
          <div className="hj-eyebrow">{BRAND.event} · Join a room</div>
          <h1 className="hj-title">Drop into a cove.</h1>
          <p className="hj-sub">
            Punch in the four-letter word the host sent you. No keyboard required after that.
          </p>

          <div className="room-code-label">Enter the room word</div>
          <div className="code-input-row">
            {inputCode.map((c, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                className={`code-input ${c ? "filled" : ""}`}
                maxLength={1}
                value={c}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <div className="recent-rooms" style={{ marginTop: 12 }}>
            <h4>Recent rooms</h4>
            {RECENT.map((r) => (
              <button key={r.code} type="button" className="recent-chip" onClick={() => setQuickCode(r.code)}>
                {r.emoji} {r.code}
              </button>
            ))}
          </div>

          <div className="name-row" style={{ marginTop: 20 }}>
            <label htmlFor="join-name">Your player name</label>
            <input
              id="join-name"
              className="name-input"
              placeholder="e.g. Mango Molly"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
          </div>

          <div className="action-row" style={{ marginTop: 24 }}>
            <Link href="/" className="btn ghost" style={{ flex: "0 0 auto", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ← Back
            </Link>
            <button
              type="button"
              className="btn primary"
              style={{ flex: 1, opacity: filled && name.trim() ? 1 : 0.5 }}
              disabled={!filled || !name.trim()}
              onClick={joinRoom}
            >
              Join the cove →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
