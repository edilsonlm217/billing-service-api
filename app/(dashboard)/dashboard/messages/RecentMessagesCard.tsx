// components/RecentMessagesCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { RecentMessage } from '@/types/recent-message';

const mapStatusNumberToDisplay: Record<number, { text: string, type: 'success' | 'error' | 'pending', showReadBadge?: boolean }> = {
  0: { text: 'Erro', type: 'error' },
  1: { text: 'Pendente', type: 'pending' },
  2: { text: 'Enviada', type: 'success' },
  3: { text: 'Entregue', type: 'success' },
  4: { text: 'Lida', type: 'success', showReadBadge: true },
};

function formatDate(date: Date) {
  return date.toLocaleString();
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
  );
}