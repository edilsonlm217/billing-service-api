'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  HelpCircle,
} from 'lucide-react';
import { RecentMessage } from '@/types/recent-message';
import { getBadgesForStatus, BadgeInfo } from './utils/getBadgesForStatus';
import { Skeleton } from '@/components/ui/skeleton'; // Importe o Skeleton

function formatDate(date: Date) {
  return date.toLocaleString();
}

function renderBadgeIcon(name: string) {
  const iconProps = { className: 'w-4 h-4' };

  switch (name) {
    case 'check':
      return <CheckCircle {...iconProps} />;
    case 'eye':
      return <Eye {...iconProps} />;
    case 'alert':
      return <AlertCircle {...iconProps} />;
    case 'error':
      return <XCircle {...iconProps} />;
    default:
      return <HelpCircle {...iconProps} />;
  }
}

interface RecentMessagesCardProps {
  recentMessages: RecentMessage[];
  loading?: boolean; // nova prop para controlar loading
}

export default function RecentMessagesCard({ recentMessages, loading = false }: RecentMessagesCardProps) {
  if (loading) {
    // Skeleton loading completo (título + alguns cards "fakes")
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" /> {/* Skeleton para o título */}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="flex items-start justify-between border border-gray-200 rounded p-3 animate-pulse"
              >
                <div className="flex-1 min-w-0 pr-2 max-w-[calc(100%-80px)]">
                  <Skeleton className="h-5 w-24 mb-1" /> {/* Skeleton para telefone */}
                  <Skeleton className="h-4 w-full mb-1" /> {/* Skeleton para mensagem (linha 1) */}
                  <Skeleton className="h-4 w-5/6 mb-1" /> {/* Skeleton para mensagem (linha 2) */}
                  <Skeleton className="h-3 w-16" /> {/* Skeleton para data */}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Skeleton className="h-6 w-16" /> {/* Skeleton para badge */}
                  <Skeleton className="h-6 w-12" /> {/* Skeleton para badge secundária, se houver */}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
            const badgesToShow: BadgeInfo[] = getBadgesForStatus(message.status);

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
                      {renderBadgeIcon(badge.icon)}
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
