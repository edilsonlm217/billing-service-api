import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyWithTeam } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  // Lê o corpo como texto
  const text = await req.text();

  // Converte o texto em um objeto de parâmetros
  const params = new URLSearchParams(text);

  // Extrai os parâmetros
  const u = params.get('u');
  const p = params.get('p');
  const to = params.get('to');
  const msg = params.get('msg') || params.get('mensagem'); // usa qualquer um dos dois

  // Faça o que quiser com os dados aqui...
  console.log({ u, p, to, msg });

  // Retorna uma resposta simples
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
