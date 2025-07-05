import ClientDashboard from './messages/ClientDashboard';
import { getUser, getUserWithTeam } from '@/lib/db/queries';

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) return null;

  const userWithTeam = await getUserWithTeam(user.id);
  const { team } = userWithTeam;

  if (!team || !team.id) return null;

  const sessionId = user.email; // ou qualquer lógica para sessionId

  return <ClientDashboard sessionId={sessionId} />;
}
