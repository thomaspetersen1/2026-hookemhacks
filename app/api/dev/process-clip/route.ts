// DEV ONLY — not protected by webhook secret, only enabled outside production.
// Triggers the embedder pipeline for a given clipId so you can test without
// setting up a real Supabase webhook.
import { createClient } from "@supabase/supabase-js";
import { captionClip } from "@/lib/generation";
import { embedText } from "@/lib/embeddings";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("not available in production", { status: 403 });
  }

  const { clipId } = await req.json();
  if (!clipId) return Response.json({ error: "clipId required" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: claimed } = await supabase
    .from("clips")
    .update({ embedding_status: "processing" })
    .eq("id", clipId)
    .eq("embedding_status", "pending")
    .select("id, storage_path")
    .single();

  if (!claimed) {
    return Response.json({ ok: false, skipped: true, reason: "not pending or not found" });
  }

  try {
    const { data: blob, error } = await supabase.storage
      .from("clips")
      .download(claimed.storage_path);

    if (error || !blob) throw new Error(`storage download failed: ${error?.message}`);

    const videoBytes = new Uint8Array(await blob.arrayBuffer());
    const caption = await captionClip(videoBytes);
    const embedding = await embedText(caption);

    await supabase
      .from("clips")
      .update({ caption, embedding, embedding_status: "ready" })
      .eq("id", claimed.id);

    return Response.json({ ok: true, clipId, caption });
  } catch (err) {
    await supabase
      .from("clips")
      .update({ embedding_status: "failed" })
      .eq("id", claimed.id);

    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
