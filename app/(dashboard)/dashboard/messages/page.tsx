'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { AlertCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFetch } from '../session/useFetch';

import RecentMessagesCard from './RecentMessagesCard';
import { useCountUp } from './hooks/useCountUp';
import InsightCard from './InsightCard';
import { DashboardApiResponse } from '@/types/dashboard-api-response';
import PercentDashboard from './PercentDashboard';

// Opções de período
const TIME_WINDOWS = [
  { label: 'Última 1 hora', value: '1h' },
  { label: 'Últimas 24 horas', value: '24h' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
];

export default function ClientDashboard() {
  const [selectedWindow, setSelectedWindow] = useState('7d');
  const sessionId = 'brito@updata.com.br'; // Mantenha isso dinâmico em produção

  const { data, error, loading, execute } = useFetch<DashboardApiResponse>();

  useEffect(() => {
    if (selectedWindow && sessionId) {
      const url = `/api/dashboard?range=${selectedWindow}&sessionId=${sessionId}`;
      execute(url);
    }
  }, [selectedWindow, sessionId, execute]);

  // Desestruturando dados da API
  const totalSent = data?.totalSent ?? 0;
  const totalDelivered = data?.totalDelivered ?? 0;
  const totalRead = data?.totalRead ?? 0;
  const totalError = data?.totalError ?? 0;
  const totalPending = data?.totalPending ?? 0;
  const totalMessages = data?.totalMessages ?? 0;

  const deliveryRate = data?.deliveryRate ?? 0;
  const readRate = data?.readRate ?? 0;

  const undeliveredMessages = data?.undeliveredMessages ?? 0;
  const deliveredButUnreadMessages = data?.deliveredButUnreadMessages ?? 0;

  const recentMessages = data?.recentMessages ?? [];

  const sessionState = data?.sessionState ?? null;
  const sessionDisconnected = sessionState?.status === 'close';

  // Animação dos totais
  const animatedTotalMessages = useCountUp(!loading && !error ? totalMessages : 0);
  const animatedTotalSent = useCountUp(!loading && !error ? totalSent : 0);
  const animatedTotalDelivered = useCountUp(!loading && !error ? totalDelivered : 0);
  const animatedTotalRead = useCountUp(!loading && !error ? totalRead : 0);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard de Envio</h1>

      <div className="flex gap-4 mb-6">
        {TIME_WINDOWS.map(({ label, value }) => (
          <Button
            key={value}
            variant={selectedWindow === value ? 'default' : 'outline'}
            onClick={() => setSelectedWindow(value)}
            disabled={loading}
          >
            {label}
          </Button>
        ))}
      </div>

      {loading && (
        <Card className="bg-blue-50 border-blue-300">
          <CardContent className="flex items-center gap-4 text-blue-700">
            <AlertCircle className="w-6 h-6 animate-pulse" />
            <p className="font-semibold">Carregando dados do dashboard...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="bg-red-50 border-red-300">
          <CardContent className="flex items-center gap-4 text-red-700">
            <XCircle className="w-6 h-6" />
            <p className="font-semibold">
              Erro ao carregar dados: {error}. Tente novamente.
            </p>
          </CardContent>
        </Card>
      )}

      {sessionDisconnected && (
        <Card className="bg-red-50 border-red-300">
          <CardContent className="flex items-center gap-4 text-red-700">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">
                Sessão desconectada!
              </p>
              <p className="text-sm">
                A sessão foi encerrada e precisa ser reiniciada para que as mensagens possam ser enviadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle>Total Disparadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-gray-900">{animatedTotalMessages}</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle>Enviadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-gray-900">{animatedTotalSent}</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle>Entregues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-blue-600">{animatedTotalDelivered}</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle>Lidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-yellow-600">{animatedTotalRead}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !error && (
        <PercentDashboard
          deliveryRate={deliveryRate}
          readRate={readRate}
        />
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <InsightCard
            icon={<XCircle className="w-6 h-6" />}
            title="Mensagens Não Entregues"
            value={undeliveredMessages}
            description="Mensagens enviadas que não chegaram ao destinatário."
            color="#F44336"
          />
          <InsightCard
            icon={<Eye className="w-6 h-6" />}
            title="Mensagens Entregues Não Lidas"
            value={deliveredButUnreadMessages}
            description="Mensagens entregues mas que ainda não foram abertas."
            color="#FFC107"
          />
          <InsightCard
            icon={<XCircle className="w-6 h-6" />}
            title="Mensagens com Erro"
            value={totalError}
            description="Mensagens que retornaram erro ao enviar."
            color="#E91E63"
          />
          <InsightCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="Mensagens Pendentes"
            value={totalPending}
            description="Mensagens aguardando processamento ou envio."
            color="#FFA726"
          />
        </div>
      )}

      {!loading && !error && recentMessages.length > 0 && (
        <RecentMessagesCard recentMessages={recentMessages} />
      )}
    </div>
  );
}
