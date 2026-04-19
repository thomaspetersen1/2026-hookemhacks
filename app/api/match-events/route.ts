import { NextRequest } from "next/server";
import { serviceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";

// ActionEvent — named to avoid collision with the existing GameEvent type
// in lib/multiplayer/types.ts (which is used for room signaling).
interface ActionEvent {
  type: string;
  subtype?: string;
  occurredAt: number;   // epoch ms
  matchTimeMs: number;
  metadata?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const { matchId, playerId, events } = (await req.json()) as {
    matchId: string;
    playerId: string;
    events: ActionEvent[];
  };

  if (!matchId || !playerId || !Array.isArray(events) || events.length === 0) {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }

  const rows = events.map((e) => ({
    match_id: matchId,
    player_id: playerId,
    event_type: e.type,
    event_subtype: e.subtype ?? null,
    occurred_at: new Date(e.occurredAt).toISOString(),
    match_time_ms: e.matchTimeMs,
    metadata: e.metadata ?? {},
  }));

  const supabase = serviceClient();
  const { error } = await supabase.from("match_events").insert(rows);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, inserted: rows.length });
}
