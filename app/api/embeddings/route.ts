import { NextRequest, NextResponse } from "next/server";

// POST /api/embeddings — generate pose embeddings for VectorDB
export async function POST(req: NextRequest) {
  const { pose } = await req.json();
  return NextResponse.json({ embedding: [] });
}
