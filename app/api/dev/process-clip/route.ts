// DEV ONLY — not protected by webhook secret, only enabled outside production.
// Triggers the embedder pipeline for a given clipId so you can test without
// setting up a real Supabase webhook.
import { serviceClient } from "@/lib/supabase/serviceClient";
import { claimClipForEmbedding, processClip } from "@/lib/clips/embedClip";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("not available in production", { status: 403 });
  }

  const { clipId } = await req.json();
  if (!clipId) return Response.json({ error: "clipId required" }, { status: 400 });

  const supabase = serviceClient();
  const { data: claimed } = await claimClipForEmbedding(supabase, clipId);

  if (!claimed) {
    return Response.json({ ok: false, skipped: true, reason: "not pending or not found" });
  }

  try {
    await processClip(supabase, claimed);
    return Response.json({ ok: true, clipId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
