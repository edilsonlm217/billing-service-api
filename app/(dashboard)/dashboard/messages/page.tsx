'use client';

import React, { useState, useEffect } from 'react'; // Importado useEffect
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFetch } from '../session/useFetch'; // Verifique o caminho correto para o seu useFetch

// --- Interfaces (Copie estas interfaces para um arquivo compartilhado como src/interfaces/dashboard.interface.ts) ---
// Enum (ou tipo union de string) para os status de mensagem
// Use os nomes em PT-BR que você mapeou na API
export type MessageStatusString = 'Erro' | 'Pendente' | 'Enviado' | 'Entregue' | 'Lido' | 'Reproduzido' | 'Desconhecido';

// Interface para um item de mensagem recente
export interface RecentMessage {
  sessionId: string;
  messageId: string;
  to: string;
  content: string;
  sentAt: number; // Timestamp em milissegundos
  status: number; // O número do status (0, 1, 2, etc.)
  // Adicione 'read?: boolean' aqui se a API já informar
  // Ou se você precisar inferir isso de 'status' para os badges
}

// Interface para um item de dados do histograma
export interface HistogramBarGrouped {
  x: number;   // timestamp em ms para eixo X
  g: MessageStatusString; // Status como string (Ex: 'Enviado', 'Desconhecido')
  y: number;   // contagem de mensagens
}

// Interface principal para a resposta completa do dashboard
export interface DashboardApiResponse {
  totalMessages: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  recentMessages: RecentMessage[];
  histogramData: HistogramBarGrouped[];
}

// --- Fim das Interfaces ---

// Opções de período
const TIME_WINDOWS = [
  { label: 'Última 1 hora', value: '1h' },
  { label: 'Últimas 24 horas', value: '24h' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
];

// Função para formatar data no padrão local
function formatDate(date: Date) {
  return date.toLocaleString();
}

// Mapeamento de status numéricos para string e para o status de badge
// Ajuste este mapeamento conforme os números de status que sua API retorna
const mapStatusNumberToDisplay: Record<number, { text: string, type: 'success' | 'error' | 'pending', showReadBadge?: boolean }> = {
  // 0: Mensagem enviada para o servidor da UPdata/fila de envio
  0: { text: 'Pendente', type: 'pending' },
  // 1: Falha no envio para o provedor (WhatsApp, etc.)
  1: { text: 'Erro', type: 'error' },
  // 2: Enviada para o provedor E entregue no aparelho (um check)
  2: { text: 'Entregue', type: 'success' },
  // 3: Entregue no aparelho E lida pelo destinatário (dois checks + olho)
  3: { text: 'Entregue', type: 'success', showReadBadge: true }, // Mudei aqui: texto principal continua "Entregue", mas indica que é lida
};


// Gráfico de barras para múltiplas séries (Não renderizado por enquanto, mas mantido para referência futura)
/*
function MultiBarChart({ data }: { data: Record<string, number[]> }) {
  const keys = Object.keys(data);
  const max = Math.max(...Object.values(data).flat(), 1); // Garante min 1 para evitar divisão por zero
  const barWidth = 20;
  const barSpacing = 8;
  const groupSpacing = 12;

  const width = data[keys[0]]
    ? data[keys[0]].length * (keys.length * (barWidth + barSpacing) + groupSpacing)
    : 0;

  return (
    <svg width={width} height={100}>
      <rect x="0" y="0" width={width} height="100" fill="#f0f0f0" rx="5" ry="5" />
      {data[keys[0]]?.map((_, i) => {
        return keys.map((key, idx) => {
          const value = data[key][i];
          const barHeight = (value / max) * 80;
          return (
            <rect
              key={`${key}-${i}`}
              x={
                i * (keys.length * (barWidth + barSpacing) + groupSpacing) +
                idx * (barWidth + barSpacing)
              }
              y={100 - barHeight}
              width={barWidth}
              height={barHeight}
              fill={
                key === 'Enviado' ? '#22c55e' : key === 'Entregue' ? '#3b82f6' : key === 'Lido' ? '#f59e0b' : '#ef4444'
              }
              rx={4}
            />
          );
        });
      })}
    </svg>
  );
}
*/

export default function ClientDashboard() {
  const [selectedWindow, setSelectedWindow] = useState('7d');
  // Ajuste o sessionId para o valor real da sessão do usuário
  // Por exemplo: obtendo de um contexto de autenticação, de props, ou de um cookie.
  const sessionId = 'brito@updata.com.br'; // Valor fixo para teste

  // Use o hook useFetch com a interface DashboardApiResponse
  const { data, error, loading, execute } = useFetch<DashboardApiResponse>();

  // --- Efeito para disparar a requisição de dados ---
  useEffect(() => {
    // Apenas faça a requisição se tivermos o sessionId e a janela selecionada
    if (selectedWindow && sessionId) {
      const url = `/api/dashboard?range=${selectedWindow}&sessionId=${sessionId}`;
      execute(url);
    }
  }, [selectedWindow, sessionId, execute]); // `execute` como dependência, pois vem de useCallback no hook

  // --- Processamento dos dados para os cards ---
  // Inicialize os valores com 0 para garantir que sejam sempre números, mesmo antes dos dados carregarem
  const totalMessages = data?.totalMessages ?? 0;
  const totalSent = data?.totalSent ?? 0;
  const totalDelivered = data?.totalDelivered ?? 0;
  const totalRead = data?.totalRead ?? 0;

  // --- Renderização do Componente ---
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard de Envio</h1>

      {/* Filtro janela temporal */}
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

      {/* Feedback de carregamento/erro */}
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

      {/* Alerta (exemplo fixo, mantido conforme estava) */}
      <Card className="bg-red-50 border-red-300">
        <CardContent className="flex items-center gap-4 text-red-700">
          <AlertCircle className="w-6 h-6" />
          <p className="font-semibold">
            Sessão desconectada! As mensagens não estão sendo enviadas.
          </p>
        </CardContent>
      </Card>

      {/* Cards resumo - Renderiza apenas se não estiver carregando e não houver erro */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle>Total de Mensagens</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Usa totalMessages direto do data */}
              <p className="text-4xl font-extrabold text-gray-900">{totalMessages}</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle>Enviadas</CardTitle> {/* Mudei para Enviadas, mas use totalSent */}
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-gray-900">{totalSent}</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle>Entregues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-blue-600">{totalDelivered}</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle>Lidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-yellow-600">{totalRead}</p>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Gráfico com as 3 séries (oculto por enquanto) */}
      <Card>
        <CardHeader>
          <CardTitle>
            Mensagens Enviadas / Entregues / Lidas na Última{' '}
            {selectedWindow.replace('h', ' hora(s)').replace('d', ' dia(s)')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* O MultiBarChart não será renderizado agora, mas está aqui para referência futura. */}
          {/* Quando for implementado, ele usará `histogramData` da API. */}
          {/* <MultiBarChart data={transformedHistogramData} /> */}
          <p className="text-muted-foreground">Gráfico do Histograma será implementado aqui.</p>
        </CardContent>
      </Card>

      {!loading && !error && data?.recentMessages && data.recentMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentMessages.map((message) => {
                const statusInfo = mapStatusNumberToDisplay[message.status] || { text: 'Desconhecido', type: 'pending' };
                const showReadBadge = statusInfo.showReadBadge || false;

                const badgeVariant: "outline" = "outline";
                let badgeTextColor = 'text-gray-600';
                let badgeBorderColor = 'border-gray-600';
                let badgeIcon = <AlertCircle className="w-4 h-4" />;

                if (statusInfo.type === 'success') {
                  badgeTextColor = 'text-green-600';
                  badgeBorderColor = 'border-green-600';
                  badgeIcon = <CheckCircle className="w-4 h-4" />;
                } else if (statusInfo.type === 'error') {
                  badgeTextColor = 'text-red-600';
                  badgeBorderColor = 'border-red-600';
                  badgeIcon = <XCircle className="w-4 h-4" />;
                } else if (statusInfo.type === 'pending') {
                  badgeTextColor = 'text-yellow-600';
                  badgeBorderColor = 'border-yellow-600';
                  badgeIcon = <AlertCircle className="w-4 h-4" />;
                }

                return (
                  <div
                    key={message.messageId}
                    className="flex items-start justify-between border border-gray-200 rounded p-3"
                  >
                    {/* Alterações para responsividade do texto: max-w, overflow-hidden e ajuste de flex */}
                    <div className="flex-1 min-w-0 pr-2 max-w-[calc(100%-80px)] overflow-hidden">
                      <p className="font-semibold">+{message.to}</p>
                      <p className="text-sm text-muted-foreground break-words">{message.content}</p>
                      <p className="text-xs text-gray-400">{formatDate(new Date(message.sentAt))}</p>
                    </div>
                    {/* flex-shrink-0 para garantir que os badges não encolham */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge
                        variant={badgeVariant}
                        className={`flex items-center gap-1 ${badgeTextColor} ${badgeBorderColor}`}
                      >
                        {badgeIcon}
                        {statusInfo.text}
                      </Badge>

                      {showReadBadge && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-yellow-600 border-yellow-600"
                        >
                          <Eye className="w-4 h-4" />
                          Lida
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (!data || (data.recentMessages && data.recentMessages.length === 0)) && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhuma mensagem recente encontrada para a janela selecionada.
          </CardContent>
        </Card>
      )}
    </div>
  );
}