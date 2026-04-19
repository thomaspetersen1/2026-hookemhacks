import { after } from "next/server";
import { serviceClient } from "@/lib/supabase/serviceClient";
import {
  claimClipForEmbedding,
  processClip,
  type ClaimedClip,
} from "@/lib/clips/embedClip";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (req.headers.get("x-webhook-secret") !== process.env.EMBEDDER_WEBHOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  const body = await req.json();
  const clipId = body.record?.id as string | undefined;
  if (!clipId) return new Response("no id", { status: 400 });

  const supabase = serviceClient();
  const { data } = await claimClipForEmbedding(supabase, clipId);
  const claimed = data as ClaimedClip | null;

  if (!claimed) return Response.json({ ok: true, skipped: true });

  // Skip clips with no detected events — nothing to search for.
  const totalEvents = Object.values(claimed.event_counts ?? {})
    .reduce((a, b) => a + (Number(b) || 0), 0);

  if (totalEvents === 0) {
    await supabase.from("clips").update({ embedding_status: "skipped" }).eq("id", claimed.id);
    return Response.json({ ok: true, skipped: true });
  }

  after(processClip(supabase, claimed).catch((err) =>
    console.error("[embedder] failed", clipId, err)
  ));

  return Response.json({ ok: true, queued: true });
}
