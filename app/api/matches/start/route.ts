import { NextRequest } from "next/server";
import { serviceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { roomId } = (await req.json()) as { roomId: string };

  if (!roomId) {
    return Response.json({ error: "roomId required" }, { status: 400 });
  }

  const supabase = serviceClient();

  const { data, error } = await supabase
    .from("matches")
    .insert({ room_id: roomId })
    .select("id, started_at")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ matchId: data.id, startedAt: data.started_at });
}
