import { NextRequest } from "next/server";
import { serviceClient } from "@/lib/supabase/serviceClient";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { matchId } = (await req.json()) as { matchId: string };

  if (!matchId) {
    return Response.json({ error: "matchId required" }, { status: 400 });
  }

  const supabase = serviceClient();

  // Close the match row
  const { error: closeErr } = await supabase
    .from("matches")
    .update({ ended_at: new Date().toISOString(), status: "finished" })
    .eq("id", matchId);

  if (closeErr) {
    return Response.json({ error: closeErr.message }, { status: 500 });
  }

  // Write match_summaries by aggregating match_events for this match.
  // Uses a raw RPC call since Supabase JS client can't express GROUP BY aggregations
  // across multiple players in one shot.
  const { error: rpcErr } = await supabase.rpc("write_match_summary", {
    p_match_id: matchId,
  });

  if (rpcErr) {
    // Non-fatal: summary will be missing but match is closed.
    console.error("write_match_summary failed", matchId, rpcErr.message);
  }

  return Response.json({ ok: true });
}
