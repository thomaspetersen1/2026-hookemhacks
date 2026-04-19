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

  // Bump winner record immediately on first close — independent of whether we
  // can resolve the loser. A loser with zero match_events (quick KO, no
  // detected punches) must not block the winner's career update.
  if (wasFirstClose && winnerId) {
    const { error: wErr } = await supabase.rpc("bump_player_record", {
      p_player_id: winnerId,
      p_won: true,
    });
    if (wErr) console.error("bump winner record failed", winnerId, wErr.message);
  }

  // Resolve loserId in priority order:
  //  1. Client-supplied hint (winning tab has it via channel presence).
  //  2. match_events — reliable when the loser threw at least one detected
  //     punch that got flushed.
  //  3. room_players via matches.room_id — durable source of truth, doesn't
  //     depend on in-match telemetry. This is the one that catches the
  //     "loser never swung" case.
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
  if (wasFirstClose && winnerId && !loserId) {
    const { data: matchRow } = await supabase
      .from("matches")
      .select("room_id")
      .eq("id", matchId)
      .maybeSingle();
    if (matchRow?.room_id) {
      const { data: peers } = await supabase
        .from("room_players")
        .select("player_id")
        .eq("room_id", matchRow.room_id)
        .neq("player_id", winnerId)
        .limit(1);
      loserId = peers?.[0]?.player_id ?? undefined;
    }
  }

  if (wasFirstClose && winnerId && loserId && winnerId !== loserId) {
    const { error: lErr } = await supabase.rpc("bump_player_record", {
      p_player_id: loserId,
      p_won: false,
    });
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
