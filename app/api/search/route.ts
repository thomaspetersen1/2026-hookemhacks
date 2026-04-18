import { NextRequest, NextResponse } from "next/server";

// POST /api/search — Gemini multimodal search proxy
export async function POST(req: NextRequest) {
  const { query } = await req.json();
  return NextResponse.json({ results: [] });
}
