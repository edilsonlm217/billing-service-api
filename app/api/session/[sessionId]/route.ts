import { NextRequest } from 'next/server';
import QRCode from 'qrcode';

export async function GET(req: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await context.params;

  const streamUrl = `${process.env.BAILEYS_API_URL}/sessions/${sessionId}/stream`;

  const baileysResponse = await fetch(streamUrl, {
    headers: { Accept: 'text/event-stream' },
  });

  if (!baileysResponse.ok || !baileysResponse.body) {
    const errorBody = await baileysResponse.text();
    return new Response(errorBody, {
      status: baileysResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { readable, writable } = new TransformStream();

  const writer = writable.getWriter();
  const reader = baileysResponse.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const processChunk = async () => {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value);

      // Intercepta linha por linha de evento SSE
      const lines = chunkText.split('\n').map(line => line.trim());
      const modifiedLines = await Promise.all(
        lines.map(async (line) => {
          if (line.startsWith('data:')) {
            try {
              const json = JSON.parse(line.slice(5));
              if (json?.state?.qrCode) {
                const base64 = await QRCode.toDataURL(json.state.qrCode);
                json.state.qrCode = base64;
                return `data: ${JSON.stringify(json)}`;
              }
            } catch {
              // ignora parsing inválido
            }
          }
          return line;
        })
      );


      const finalChunk = modifiedLines.join('\n') + '\n\n';
      await writer.write(encoder.encode(finalChunk));
    }

    await writer.close();
  };

  processChunk().catch((err) => {
    console.error('[ERRO NA INTERCEPTAÇÃO SSE]', err);
  });

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
