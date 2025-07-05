import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range');
    const sessionId = searchParams.get('sessionId');

    if (!range || !sessionId) {
      return NextResponse.json(
        { message: 'Missing range or sessionId query parameter.' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.BAILEYS_API_URL;
    if (!baseUrl) {
      console.error('BAILEYS_API_URL is not defined in environment variables.');
      return NextResponse.json(
        { message: 'API base URL is not configured.' },
        { status: 500 }
      );
    }

    const externalApiUrl = `${baseUrl}/dashboard?range=${range}&sessionId=${sessionId}`;

    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error from external API' }));
      console.error(`Error from external API (${response.status}):`, errorData);
      return NextResponse.json(
        { message: `Failed to fetch data from external API: ${errorData.message || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
