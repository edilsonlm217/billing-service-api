'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCountUp } from './hooks/useCountUp';

interface MetricCardsProps {
  totalMessages?: number;
  totalSent?: number;
  totalDelivered?: number;
  totalRead?: number;
}

export default function MetricCards({
  totalMessages,
  totalSent,
  totalDelivered,
  totalRead,
}: MetricCardsProps) {
  const loading =
    totalMessages === undefined ||
    totalSent === undefined ||
    totalDelivered === undefined ||
    totalRead === undefined;

  // Passa 0 para o hook enquanto carrega para evitar erro e piscar
  const animatedTotalMessages = useCountUp(loading ? 0 : totalMessages!);
  const animatedTotalSent = useCountUp(loading ? 0 : totalSent!);
  const animatedTotalDelivered = useCountUp(loading ? 0 : totalDelivered!);
  const animatedTotalRead = useCountUp(loading ? 0 : totalRead!);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <Card className="border border-gray-300">
        <CardHeader>
          {loading ? <Skeleton className="w-3/4 h-5 mb-2" /> : <CardTitle>Total Disparadas</CardTitle>}
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="w-20 h-10" /> : <p className="text-4xl font-extrabold text-gray-900">{animatedTotalMessages}</p>}
        </CardContent>
      </Card>

      <Card className="border border-gray-300">
        <CardHeader>
          {loading ? <Skeleton className="w-3/4 h-5 mb-2" /> : <CardTitle>Enviadas</CardTitle>}
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="w-20 h-10" /> : <p className="text-4xl font-extrabold text-gray-900">{animatedTotalSent}</p>}
        </CardContent>
      </Card>

      <Card className="border border-gray-300">
        <CardHeader>
          {loading ? <Skeleton className="w-3/4 h-5 mb-2" /> : <CardTitle>Entregues</CardTitle>}
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="w-20 h-10" />
          ) : (
            <p className="text-4xl font-extrabold text-blue-600">{animatedTotalDelivered}</p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-300">
        <CardHeader>
          {loading ? <Skeleton className="w-3/4 h-5 mb-2" /> : <CardTitle>Lidas</CardTitle>}
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="w-20 h-10" />
          ) : (
            <p className="text-4xl font-extrabold text-yellow-600">{animatedTotalRead}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
