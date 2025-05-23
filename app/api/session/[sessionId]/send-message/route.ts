import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyWithTeam } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  // Lê o body como ArrayBuffer
  const buf = await req.arrayBuffer();

  // Cria um decoder Latin1 para interpretar o buffer
  const decoder = new TextDecoder('iso-8859-1');

  // Decodifica o buffer como Latin1
  const textLatin1 = decoder.decode(buf);

  // Agora cria URLSearchParams normalmente
  const params = new URLSearchParams(textLatin1);

  const u = params.get('u');
  const p = params.get('p');
  const to = params.get('to');
  let msg = params.get('msg') || params.get('mensagem');

  // Substitui \r\n por \n
  if (msg) {
    msg = msg.replace(/\r\n/g, '\n');
  }

  console.log({ u, p, to, msg });

  return NextResponse.json({ ok: true });

  // const authHeader = req.headers.get('authorization');

  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  // const apiKey = authHeader.split(' ')[1];
  // const result = await getApiKeyWithTeam(apiKey);

  // if (!result || !result.apiKey.active) {
  //   return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 403 });
  // }

  // const { team } = result;

  // // const status = team.subscriptionStatus;
  // // if (status !== 'active' && status !== 'trialing') {
  // //   return NextResponse.json(
  // //     { error: 'Subscription inactive or expired' },
  // //     { status: 402 }
  // //   );
  // // }

  // const body = await req.json();
  // const { to, text } = body;
  // const sessionId = 'cliente-whatsapp-01';

  // const baileysRes = await fetch(`${process.env.BAILEYS_API_URL}/sessions/${sessionId}/send-message`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ to, message: text }),
  // });

  // const baileysJson = await baileysRes.json();

  // return NextResponse.json(baileysJson, { status: baileysRes.status });
}
