import { NextRequest, NextResponse } from 'next/server';
import { fixAccents, normalizeLineBreaks } from '@/utils/message-format';
import { normalizePhone } from '@/utils/phone';
import { getApiKeyWithTeam } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const u = params.get('u');
  const p = params.get('p');
  const toRaw = params.get('to') || '';
  let msgRaw = params.get('msg') || params.get('mensagem') || '';
  const apiKey = p;

  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getApiKeyWithTeam(apiKey);

  if (!result || !result.apiKey.active) {
    return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 403 });
  }

  const { team } = result;

  const status = team.subscriptionStatus;
  const isAuthorized = status === 'active' || status === 'trialing';
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Subscription inactive or expired' },
      { status: 402 }
    );
  }

  // Apply transformations
  let msg = normalizeLineBreaks(fixAccents(msgRaw));
  const to = normalizePhone(toRaw);

  const sessionId = u;

  const baileysRes = await fetch(`${process.env.BAILEYS_API_URL}/sessions/${sessionId}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, message: msg }),
  });

  const baileysJson = await baileysRes.json();

  return NextResponse.json(baileysJson, { status: baileysRes.status });
}
