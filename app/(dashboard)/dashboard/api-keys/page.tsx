import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiKeys, getUser, getUserWithTeam } from '@/lib/db/queries';
import ApiKeysClient from './ApiKeysClient'; // ajuste o caminho se necessário
import { ApiKeyInstructions } from './ApiKeyInstructions';

export default async function ApiKeysPage() {
  const user = await getUser();
  if (!user) return null;

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam.teamId) return null;

  const apiKeys = await getApiKeys(userWithTeam.teamId);

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-900 mb-8">API Keys</h1>

      <ApiKeyInstructions /> {/* 🔄 substitui a explicação inline por componente */}
      
      <ApiKeysClient initialKeys={apiKeys} />
    </section>
  );
}
