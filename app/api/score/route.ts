import { NextRequest, NextResponse } from "next/server";

// POST /api/score — calculate score and calories burned
export async function POST(req: NextRequest) {
  const { moves } = await req.json();
  return NextResponse.json({ score: 0, caloriesBurned: 0 });
}
