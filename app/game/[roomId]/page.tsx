export default function GamePage({ params }: { params: { roomId: string } }) {
  return (
    <main>
      <h1>Room: {params.roomId}</h1>
    </main>
  );
}
