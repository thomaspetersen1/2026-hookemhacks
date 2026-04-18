import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-black font-mono text-zinc-100">
      <main className="flex w-full max-w-3xl flex-col items-center gap-10 px-6 py-20 text-center">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] uppercase tracking-[0.4em] text-cyan-400">
            HookEmHacks 2026
          </span>
          <h1 className="text-5xl font-bold tracking-tight">
            Motion<span className="text-orange-400">Arena</span>
          </h1>
          <p className="max-w-md text-sm text-zinc-400">
            A Wii-Sports-style multimodal motion game. Webcam in, skeleton out,
            avatar driven, sessions indexed, highlights generated.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/game/demo"
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-orange-400"
          >
            Enter Arena
          </Link>
          <Link
            href="/game/demo?debug=1"
            className="rounded-full border border-zinc-700 px-6 py-3 text-sm uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            Enter (debug)
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
          <span>· Swords</span>
          <span>· Ping Pong</span>
          <span>· Golf</span>
        </div>
      </main>
    </div>
  );
}
