import { NextRequest } from 'next/server';
import QRCode from 'qrcode';

export async function GET(req: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await context.params;

  console.log('[SSE API] Início da função GET');
  console.log(`[SSE API] sessionId: ${sessionId}`);

  const streamUrl = `${process.env.BAILEYS_API_URL}/sessions/${sessionId}/stream`;
  console.log(`[SSE API] Conectando a stream externa: ${streamUrl}`);

  let baileysResponse: Response;
  try {
    baileysResponse = await fetch(streamUrl, {
      headers: { Accept: 'text/event-stream' },
    });
  } catch (err) {
    console.error('[SSE API] Erro ao fazer fetch para stream externa:', err);
    return new Response('Erro ao conectar com o serviço de stream.', { status: 500 });
  }

  if (!baileysResponse.ok || !baileysResponse.body) {
    const errorBody = await baileysResponse.text();
    console.error('[SSE API] Resposta da stream externa falhou:', errorBody);
    return new Response(errorBody, {
      status: baileysResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log('[SSE API] Conectado com sucesso à stream externa');

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = baileysResponse.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  // Força flush inicial para abrir conexão no navegador
  await writer.write(encoder.encode(': init\n\n'));
  console.log('[SSE API] Enviado chunk inicial ": init\\n\\n"');

  const processChunk = async () => {
    console.log('[SSE API] Iniciando leitura da stream externa');
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        console.log('[SSE API] Stream externa fechou (done = true)');
        break;
      }

      console.log('[SSE API] Chunk recebido da stream externa');
      const chunkText = decoder.decode(value);
      console.log('[SSE API] Texto do chunk:', chunkText);

      const lines = chunkText.split('\n').map(line => line.trim());
      const modifiedLines = await Promise.all(
        lines.map(async (line) => {
          if (line.startsWith('data:')) {
            try {
              const json = JSON.parse(line.slice(5));
              if (json?.state?.qrCode) {
                console.log('[SSE API] QR code encontrado, convertendo para base64');
                const base64 = await QRCode.toDataURL(json.state.qrCode);
                json.state.qrCode = base64;
                return `data: ${JSON.stringify(json)}`;
              }
            } catch (err) {
              console.warn('[SSE API] Erro ao tentar parsear linha de data como JSON:', err);
            }
          }
          return line;
        })
      );

      const finalChunk = modifiedLines.join('\n') + '\n\n';
      console.log('[SSE API] Enviando chunk modificado para o navegador:', finalChunk);

      await writer.write(encoder.encode(finalChunk));
    }

    await writer.close();
    console.log('[SSE API] Stream local encerrada');
  };

  processChunk().catch((err) => {
    console.error('[SSE API] ERRO NA INTERCEPTAÇÃO SSE:', err);
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
