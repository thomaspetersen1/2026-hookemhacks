import { NextRequest, NextResponse } from "next/server";

// POST /api/generate/commentary — AI commentary for gameplay moments
export async function POST(req: NextRequest) {
  const { gameState } = await req.json();
  return NextResponse.json({ commentary: "" });
}
