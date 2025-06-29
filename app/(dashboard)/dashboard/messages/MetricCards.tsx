'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCountUp } from './hooks/useCountUp';

interface MetricCardsProps {
  totalMessages: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
}

export default function MetricCards({
  totalMessages,
  totalSent,
  totalDelivered,
  totalRead,
}: MetricCardsProps) {
  const animatedTotalMessages = useCountUp(totalMessages);
  const animatedTotalSent = useCountUp(totalSent);
  const animatedTotalDelivered = useCountUp(totalDelivered);
  const animatedTotalRead = useCountUp(totalRead);

  return (
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
  );
}
