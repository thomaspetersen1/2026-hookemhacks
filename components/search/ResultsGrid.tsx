"use client";

export default function ResultsGrid({ results }: { results: { id: string; url: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {results.map((r) => (
        <video key={r.id} src={r.url} controls />
      ))}
    </div>
  );
}
