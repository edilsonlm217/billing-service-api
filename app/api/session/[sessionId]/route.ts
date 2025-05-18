export const runtime = 'nodejs';

import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import QRCode from 'qrcode';

type SessionState = {
  sessionId: string;
  status: 'connecting' | 'open' | 'close' | 'logged-out' | 'qr-timeout';
  qrCode: string | null;
  creds: {
    contact?: {
      id: string;
      lid?: string;
      name?: string;
    };
    phonePlatform?: string;
  } | null;
  lastUpdated: string;
};

export async function GET(req: NextApiRequest, res: NextApiResponse, context: { params: Promise<{ sessionId: string }> }) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let count = 0;

      function push() {
        if (count >= 10) {
          controller.close();
          return;
        }

        // Monta o payload conforme seu tipo SessionState
        const sessionState = {
          sessionId: 'session-123',
          status: 'connecting',
          qrCode: null,
          creds: null,
          lastUpdated: new Date().toISOString(),
        } as SessionState;

        const payload = `data: ${JSON.stringify(sessionState)}\n\n`;
        controller.enqueue(encoder.encode(payload));

        count++;
        setTimeout(push, 3000);
      }

      push();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      // CORS se necessário:
      // 'Access-Control-Allow-Origin': '*',
    },
  });
}