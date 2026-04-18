import { NextResponse } from "next/server";

// POST /api/rooms — create a new game room
export async function POST() {
  return NextResponse.json({ roomId: "" });
}
