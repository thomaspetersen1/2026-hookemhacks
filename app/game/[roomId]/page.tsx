"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Backdrop } from "@/components/scenery/Scenery";
import { Calibration } from "@/components/pages/Calibration";
import { GameScreen } from "@/components/pages/GameScreen";
import { Results } from "@/components/pages/Results";
import { TWEAK_DEFAULTS } from "@/components/shared/constants";

type GameStep = "calibrate" | "game" | "results";

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [step, setStep] = useState<GameStep>("game");
  const [matchPct, setMatchPct] = useState(TWEAK_DEFAULTS.matchPct);

  return (
    <div className="app-stage" data-time="day" data-intensity="normal">
      <Backdrop />

      {step === "calibrate" && (
        <Calibration
          matchPct={matchPct}
          setMatchPct={setMatchPct}
          onNext={() => setStep("game")}
        />
      )}

      {step === "game" && (
        <GameScreen
          playerCount={TWEAK_DEFAULTS.playerCount}
          scoreLevel={TWEAK_DEFAULTS.scoreLevel}
          onEnd={() => setStep("results")}
        />
      )}

      {step === "results" && (
        <Results
          playerCount={TWEAK_DEFAULTS.playerCount}
          scoreLevel={TWEAK_DEFAULTS.scoreLevel}
          onPlayAgain={() => {
            setMatchPct(TWEAK_DEFAULTS.matchPct);
            setStep("calibrate");
          }}
          onBackToLobby={() => router.push(`/lobby/${roomId}`)}
        />
      )}
    </div>
  );
}
