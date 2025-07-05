// components/RecentMessagesCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { RecentMessage } from '@/types/recent-message';

type BadgeType = 'success' | 'error' | 'pending';

interface BadgeInfo {
  text: string;
  type: BadgeType;
  icon: React.ReactNode;
  colorClass: string;  // Tailwind text color
  borderClass: string; // Tailwind border color
}

const badgeDefinitions: Record<string, BadgeInfo> = {
  Enviada: {
    text: 'Enviada',
    type: 'success',
    icon: <CheckCircle className="w-4 h-4" />,
    colorClass: 'text-green-600',
    borderClass: 'border-green-600',
  },
  Entregue: {
    text: 'Entregue',
    type: 'success',
    icon: <CheckCircle className="w-4 h-4" />,
    colorClass: 'text-blue-600',
    borderClass: 'border-blue-600',
  },
  Lida: {
    text: 'Lida',
    type: 'success',
    icon: <Eye className="w-4 h-4" />,
    colorClass: 'text-yellow-600',
    borderClass: 'border-yellow-600',
  },
  Pendente: {
    text: 'Pendente',
    type: 'pending',
    icon: <AlertCircle className="w-4 h-4" />,
    colorClass: 'text-yellow-600',
    borderClass: 'border-yellow-600',
  },
  Erro: {
    text: 'Erro',
    type: 'error',
    icon: <XCircle className="w-4 h-4" />,
    colorClass: 'text-red-600',
    borderClass: 'border-red-600',
  },
  Desconhecido: {
    text: 'Desconhecido',
    type: 'pending',
    icon: <AlertCircle className="w-4 h-4" />,
    colorClass: 'text-gray-600',
    borderClass: 'border-gray-600',
  },
};

function formatDate(date: Date) {
  return date.toLocaleString();
}

function getBadgesForStatus(status: number): BadgeInfo[] {
  switch (status) {
    case 0: // Erro
      return [badgeDefinitions.Erro];
    case 1: // Pendente
      return [badgeDefinitions.Pendente];
    case 2: // Enviada
      return [badgeDefinitions.Enviada];
    case 3: // Entregue
      return [badgeDefinitions.Enviada, badgeDefinitions.Entregue];
    case 4: // Lida
      return [
        badgeDefinitions.Enviada,
        badgeDefinitions.Entregue,
        badgeDefinitions.Lida,
      ];
    default:
      return [badgeDefinitions.Desconhecido];
  }
}

interface RecentMessagesCardProps {
  recentMessages: RecentMessage[];
}

export default function RecentMessagesCard({ recentMessages }: RecentMessagesCardProps) {
  if (recentMessages.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Nenhuma mensagem recente encontrada para a janela selecionada.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mensagens Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentMessages.map((message) => {
            const badgesToShow = getBadgesForStatus(message.status);

            return (
              <div
                key={message.messageId}
                className="flex items-start justify-between border border-gray-200 rounded p-3"
              >
                <div className="flex-1 min-w-0 pr-2 max-w-[calc(100%-80px)] overflow-hidden">
                  <p className="font-semibold">+{message.to}</p>
                  <p
                    className="text-sm text-muted-foreground break-words"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {message.content}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(new Date(message.sentAt))}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {badgesToShow.map((badge) => (
                    <Badge
                      key={badge.text}
                      variant="outline"
                      className={`flex items-center gap-1 ${badge.colorClass} ${badge.borderClass}`}
                    >
                      {badge.icon}
                      {badge.text}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
