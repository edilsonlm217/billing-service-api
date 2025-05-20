import SimpleSessionStream from "./SessionStream"
import { SessionMode } from "@/types/session-mode"

async function parseSessionResponse(
  response: Response,
  sessionId: string
): Promise<SessionMode> {
  switch (response.status) {
    case 202:
    case 409:
      return { type: 'listen', sessionId }

    case 400:
    case 500:
      return {
        type: 'unavailable',
        reason: 'Erro interno no servidor',
        sessionId,
      }

    default:
      return {
        type: 'unavailable',
        reason: 'Erro inesperado ao criar sessão',
        sessionId,
      }
  }
}

// Função mockada — você pode substituir pela real
async function checkUserSubscription(sessionId: string): Promise<boolean> {
  // Aqui você pode consultar seu banco ou serviço de billing
  return true // ou false dependendo da situação
}

export default async function SessionPage() {
  const sessionId = 'cliente-whatsapp-01'
  let mode: SessionMode

  // Verificação de assinatura primeiro
  const isAuthorized = await checkUserSubscription(sessionId)

  if (!isAuthorized) {
    mode = {
      type: 'unauthorized',
      reason: 'Sua assinatura está inativa. Ative para usar o WhatsApp.',
      sessionId,
    }

    return <SimpleSessionStream mode={mode} />
  }

  // Chamada à API de criação da sessão
  try {
    const response = await fetch(`${process.env.BAILEYS_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
      cache: 'no-store',
    })

    mode = await parseSessionResponse(response, sessionId)
  } catch (err) {
    if (err) {
      mode = {
        type: 'unavailable',
        reason: 'Não foi possível se conectar com o servidor',
        sessionId,
      }
    } else {
      mode = {
        type: 'listen',
        sessionId,
      }
    }
  }

  return <SimpleSessionStream mode={mode} />
}
