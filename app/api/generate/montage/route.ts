import { NextRequest, NextResponse } from "next/server";

// POST /api/generate/montage — generate highlight montage
export async function POST(req: NextRequest) {
  const { clips } = await req.json();
  return NextResponse.json({ montageUrl: "" });
}
