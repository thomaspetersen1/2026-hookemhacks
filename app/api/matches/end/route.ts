import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type Body = {
  matchId: string;
  winnerId?: string;
  loserId?: string;
};

export async function POST(req: NextRequest) {
  const { matchId, winnerId, loserId: bodyLoserId } = (await req.json()) as Body;

  if (!matchId) {
    return Response.json({ error: "matchId required" }, { status: 400 });
  }

  const supabase = serviceClient();

  // Close the match row. The .eq("status","active") filter makes this
  // idempotent — a duplicate call (e.g. host explicit end + unmount cleanup)
  // returns zero updated rows and we skip the career bump below.
  const update: { ended_at: string; status: string; winner_id?: string } = {
    ended_at: new Date().toISOString(),
    status: "finished",
  };
  if (winnerId) update.winner_id = winnerId;

  const { data: closed, error: closeErr } = await supabase
    .from("matches")
    .update(update)
    .eq("id", matchId)
    .eq("status", "active")
    .select("id");

  if (closeErr) {
    return Response.json({ error: closeErr.message }, { status: 500 });
  }

  const wasFirstClose = (closed?.length ?? 0) > 0;

  // Derive loserId from match_events when only winnerId was supplied — the
  // winning client can't always see the peer's playerId through channel
  // presence at KO, so the server resolves the other participant.
  let loserId = bodyLoserId;
  if (wasFirstClose && winnerId && !loserId) {
    const { data: others } = await supabase
      .from("match_events")
      .select("player_id")
      .eq("match_id", matchId)
      .neq("player_id", winnerId)
      .limit(1);
    loserId = others?.[0]?.player_id ?? undefined;
  }

  if (wasFirstClose && winnerId && loserId && winnerId !== loserId) {
    const [{ error: wErr }, { error: lErr }] = await Promise.all([
      supabase.rpc("bump_player_record", { p_player_id: winnerId, p_won: true }),
      supabase.rpc("bump_player_record", { p_player_id: loserId, p_won: false }),
    ]);
    if (wErr) console.error("bump winner record failed", winnerId, wErr.message);
    if (lErr) console.error("bump loser record failed", loserId, lErr.message);
  }

  if (wasFirstClose) {
    const { error: rpcErr } = await supabase.rpc("write_match_summary", {
      p_match_id: matchId,
    });
    if (rpcErr) {
      console.error("write_match_summary failed", matchId, rpcErr.message);
    }
  }

  return Response.json({ ok: true, closed: wasFirstClose });
}
