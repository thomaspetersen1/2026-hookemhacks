"use client";

import { useState } from "react";

export function useGameState() {
  const [score, setScore] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  return { score, setScore, caloriesBurned, setCaloriesBurned };
}
