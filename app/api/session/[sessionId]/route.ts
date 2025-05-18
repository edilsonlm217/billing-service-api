export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import QRCode from 'qrcode';

export async function GET(req: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await context.params;
  const controller = new AbortController();

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  req.signal.addEventListener('abort', () => {
    controller.abort();
    try {
      writer.close(); // encerra a stream para o cliente
    } catch (err) {
      // já pode ter sido fechada
    }
  });

  const streamUrl = `${process.env.BAILEYS_API_URL}/sessions/${sessionId}/stream`;

  let baileysResponse: Response;

  try {
    baileysResponse = await fetch(streamUrl, {
      headers: { Accept: 'text/event-stream' },
      signal: controller.signal,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro ao conectar com stream remoto' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!baileysResponse.ok || !baileysResponse.body) {
    const errorBody = await baileysResponse.text();
    return new Response(errorBody, {
      status: baileysResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const reader = baileysResponse.body.getReader();
  const decoder = new TextDecoder();

  const pump = async () => {
    try {
      while (true) {
        if (req.signal.aborted) break;

        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').map(line => line.trim());

        const processed = await Promise.all(
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
                // não é JSON válido
              }
            }
            return line;
          })
        );

        const final = processed.join('\n') + '\n\n';

        try {
          const encoded = new TextEncoder().encode(final);
          await writer.write(encoded);
        } catch (err) {
          console.log(err);
          if ((err as Error).name === 'TypeError') break; // writer já fechado
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[SSE Error]', err);
      }
    } finally {
      try {
        await writer.close();
      } catch { }
    }
  };

  pump();

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
