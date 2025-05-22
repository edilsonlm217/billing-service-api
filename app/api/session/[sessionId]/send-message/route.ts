import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyWithTeam } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = authHeader.split(' ')[1];

  const result = await getApiKeyWithTeam(apiKey);

  if (!result || !result.apiKey.active) {
    return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 403 });
  }

  const { team } = result;

  const status = team.subscriptionStatus;
  if (status !== 'active' && status !== 'trialing') {
    return NextResponse.json(
      { error: 'Subscription inactive or expired' },
      { status: 402 }
    );
  }

  const body = await req.json();
  const { to, text } = body;
  const sessionId = 'cliente-whatsapp-01'
  await fetch(`${process.env.NEST_API_URL}/sessions/${sessionId}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, message: text }),
  });


  return NextResponse.json({ success: true });
}
