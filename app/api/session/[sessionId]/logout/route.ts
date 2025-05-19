import { NextResponse } from 'next/server'

export async function POST(request: Request, context: any) {
  const { sessionId } = await context.params;

  try {
    const response = await fetch(`${process.env.BAILEYS_API_URL}/sessions/${sessionId}/logout`, {
      method: 'POST',
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: 'Erro ao fazer logout', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno', details: String(err) }, { status: 500 })
  }
}
