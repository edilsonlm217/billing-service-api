import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // 1. Obtenha os parâmetros de query da URL da requisição
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range');
    const sessionId = searchParams.get('sessionId');

    // 2. Valide se os parâmetros necessários estão presentes
    if (!range || !sessionId) {
      return NextResponse.json(
        { message: 'Missing range or sessionId query parameter.' },
        { status: 400 }
      );
    }

    // 3. Construa a URL para a sua API de staging
    const externalApiUrl = `http://api-staging.mk-messenger.com.br/dashboard?range=${range}&sessionId=${sessionId}`;

    // 4. Faça a requisição para a API externa usando fetch
    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Important for dynamic data
    });

    // 5. Verifique se a requisição foi bem-sucedida
    if (!response.ok) {
      // Tente ler o corpo da resposta para mais detalhes do erro da API externa
      const errorData = await response.json().catch(() => ({ message: 'Unknown error from external API' }));
      console.error(`Error from external API (${response.status}):`, errorData);
      return NextResponse.json(
        { message: `Failed to fetch data from external API: ${errorData.message || response.statusText}` },
        { status: response.status }
      );
    }

    // 6. Parseie a resposta JSON da API externa
    const data = await response.json();

    // 7. Retorne os dados da API externa como uma resposta JSON
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}