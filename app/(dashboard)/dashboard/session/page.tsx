import { getUser, getUserWithTeam } from "@/lib/db/queries"
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

export default async function SessionPage() {
  const user = await getUser();
  if (!user) return null;

  const userWithTeam = await getUserWithTeam(user.id);
  const { team } = userWithTeam;

  if (!team || !team.id) return null;

  const sessionId = user.email;
  let mode: SessionMode

  const subscriptionStatus = team.subscriptionStatus;
  const isAuthorized = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  if (!isAuthorized) {
    mode = {
      type: 'unauthorized',
      reason: 'Sua assinatura não está ativa. Ative para usar o WhatsApp.',
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
    });
    console.log(sessionId);
    console.log(response);

    mode = await parseSessionResponse(response, sessionId)
  } catch (err) {
    mode = {
      type: 'listen',
      sessionId,
    }
  }

  return <SimpleSessionStream mode={mode} />
}
