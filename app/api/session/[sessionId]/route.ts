export const runtime = 'nodejs';

export async function GET() {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  let count = 0;

  const interval = setInterval(async () => {
    const payload = `data: ${JSON.stringify({ message: `Ping #${count++}` })}\n\n`;
    await writer.write(encoder.encode(payload));
  }, 2000);


  // Simula desconexão segura após 60s só pra não deixar preso em ambiente de dev
  setTimeout(() => {
    clearInterval(interval);
    writer.close();
  }, 60000);

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
