import { NextRequest } from 'next/server';
import { createSseStream } from '@/lib/sse';
import { connectWithRetry } from '@/lib/sse-client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, context: any) {
  const { sessionId } = await context.params

  let externalSseClose: (() => void) | undefined;

  const stream = createSseStream(req, (send) => {
    let closed = false;

    // Abre conexão SSE externa com reconexão automática
    connectWithRetry({
      url: `${process.env.BAILEYS_API_URL}/sessions/${sessionId}/stream`,
      onMessage: (data) => {
        if (closed) return;
        // Envia os dados recebidos do SSE externo para o cliente via SSE
        send(data);
      },
      onClose: () => {
        if (!closed) {
          // opcional: envia mensagem ao cliente que a conexão externa caiu
          send({ info: 'Conexão externa fechada, tentando reconectar...' });
        }
      },
    }).then((closeFn) => {
      externalSseClose = closeFn;
    }).catch((err) => {
      if (!closed) {
        send({ error: 'Erro ao conectar SSE externo: ' + err.message });
      }
    });

    // Função de cleanup chamada quando o cliente desconecta
    return () => {
      closed = true;
      if (externalSseClose) externalSseClose();
    };
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
