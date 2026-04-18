"use client";

export default function HighlightReel({ clips }: { clips: string[] }) {
  return (
    <div>
      {clips.map((src, i) => (
        <video key={i} src={src} autoPlay muted loop />
      ))}
    </div>
  );
}
