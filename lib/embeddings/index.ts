// Uses BAAI/bge-base-en-v1.5 via HuggingFace Inference API (free tier).
// 768 dimensions — matches the vector(768) column in Supabase.
// Requires HF_TOKEN env var (read-only token from huggingface.co/settings/tokens).
export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(
    "https://api-inference.huggingface.co/models/BAAI/bge-base-en-v1.5",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!res.ok) throw new Error(`embedText failed: ${await res.text()}`);

  const json = await res.json();
  // HF returns [[...values]] for a single input
  return (Array.isArray(json[0]) ? json[0] : json) as number[];
}
