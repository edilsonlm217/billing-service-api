'use client';

import { XCircle, Eye, AlertCircle } from 'lucide-react';
import InsightCard from './InsightCard';
import { useCountUp } from './hooks/useCountUp';

interface InsightsGridProps {
  undelivered: number;
  unread: number;
  error: number;
  pending: number;
  loading?: boolean;
}

export default function InsightsGrid({
  undelivered,
  unread,
  error,
  pending,
  loading = false,
}: InsightsGridProps) {

  const animatedUndelivered = useCountUp(loading ? 0 : undelivered);
  const animatedUnread = useCountUp(loading ? 0 : unread);
  const animatedError = useCountUp(loading ? 0 : error);
  const animatedPending = useCountUp(loading ? 0 : pending);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <InsightCard
        icon={<XCircle className="w-6 h-6" />}
        title="Mensagens Não Entregues"
        value={animatedUndelivered}
        description="Mensagens enviadas que não chegaram ao destinatário."
        color="#F44336"
        loading={loading}
      />
      <InsightCard
        icon={<Eye className="w-6 h-6" />}
        title="Mensagens Entregues Não Lidas"
        value={animatedUnread}
        description="Mensagens entregues mas que ainda não foram abertas."
        color="#FFC107"
        loading={loading}
      />
      <InsightCard
        icon={<XCircle className="w-6 h-6" />}
        title="Mensagens com Erro"
        value={animatedError}
        description="Mensagens que retornaram erro ao enviar."
        color="#E91E63"
        loading={loading}
      />
      <InsightCard
        icon={<AlertCircle className="w-6 h-6" />}
        title="Mensagens Pendentes"
        value={animatedPending}
        description="Mensagens aguardando processamento ou envio."
        color="#FFA726"
        loading={loading}
      />
    </div>
  );
}
