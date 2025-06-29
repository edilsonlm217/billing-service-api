'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, XCircle, Eye } from 'lucide-react';
import { useFetch } from '../session/useFetch';

import RecentMessagesCard from './RecentMessagesCard';
import { DashboardApiResponse } from '@/types/dashboard-api-response';
import PercentDashboard from './PercentDashboard';
import TimeWindowSelector from './TimeWindowSelector';
import MetricCards from './MetricCards';
import InsightsGrid from './InsightsGrid';

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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard de Envio</h1>

      <TimeWindowSelector
        selectedWindow={selectedWindow}
        onChange={setSelectedWindow}
        disabled={loading}
      />

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
        <MetricCards
          totalMessages={!loading && !error ? totalMessages : 0}
          totalSent={!loading && !error ? totalSent : 0}
          totalDelivered={!loading && !error ? totalDelivered : 0}
          totalRead={!loading && !error ? totalRead : 0}
        />
      )}

      {!loading && !error && (
        <PercentDashboard
          deliveryRate={deliveryRate}
          readRate={readRate}
        />
      )}

      {!loading && !error && (
        <InsightsGrid
          undelivered={undeliveredMessages}
          unread={deliveredButUnreadMessages}
          error={totalError}
          pending={totalPending}
        />
      )}

      {!loading && !error && recentMessages.length > 0 && (
        <RecentMessagesCard recentMessages={recentMessages} />
      )}
    </div>
  );
}
