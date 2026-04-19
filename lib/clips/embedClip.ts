import { gemini, MODELS, EMBED_DIM, normalize } from "@/lib/gemini";
import { serviceClient } from "@/lib/supabase/serviceClient";

type Supabase = ReturnType<typeof serviceClient>;

export type ClaimedClip = {
  id: string;
  storage_path: string;
  event_counts: Record<string, number> | null;
};

export async function claimClipForEmbedding(supabase: Supabase, clipId: string) {
  return supabase
    .from("clips")
    .update({ embedding_status: "processing" })
    .eq("id", clipId)
    .eq("embedding_status", "pending")
    .select("id, storage_path, event_counts")
    .single();
}

export async function processClip(supabase: Supabase, claimed: ClaimedClip) {
  try {
    const { data: blob, error } = await supabase.storage
      .from("clips")
      .download(claimed.storage_path);

    if (error || !blob) throw new Error(`storage download failed: ${error?.message}`);

    const buffer = Buffer.from(await blob.arrayBuffer());

    const result = await gemini.models.embedContent({
      model: MODELS.embed,
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "video/webm",
                data: buffer.toString("base64"),
              },
            },
          ],
        },
      ],
      config: {
        outputDimensionality: EMBED_DIM,
        taskType: "RETRIEVAL_DOCUMENT",
      },
    });

    const embedding = result.embeddings?.[0]?.values;
    if (!embedding || embedding.length !== EMBED_DIM) {
      throw new Error(`unexpected embedding shape: ${embedding?.length}`);
    }

    await supabase
      .from("clips")
      .update({ embedding: normalize(embedding), embedding_status: "ready" })
      .eq("id", claimed.id);
  } catch (err) {
    await supabase.from("clips").update({ embedding_status: "failed" }).eq("id", claimed.id);
    throw err;
  }
}
