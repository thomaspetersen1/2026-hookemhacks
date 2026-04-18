import { GameRoomClient } from "./GameRoomClient";

export default async function GameRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { roomId } = await params;
  const { debug } = await searchParams;

  return <GameRoomClient roomId={roomId} debug={debug === "1"} />;
}
