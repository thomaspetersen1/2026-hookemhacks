"use client";

export default function QueryBar({ onSearch }: { onSearch: (q: string) => void }) {
  return (
    <input
      type="text"
      placeholder="Search gameplay moments..."
      onKeyDown={(e) => e.key === "Enter" && onSearch((e.target as HTMLInputElement).value)}
    />
  );
}
