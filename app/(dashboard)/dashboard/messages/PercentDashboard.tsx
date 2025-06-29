'use client';

import { PercentCard } from './PercentCards';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PercentDashboardProps {
  deliveryRate?: number;
  readRate?: number;
  loading: boolean;
}

export default function PercentDashboard({
  deliveryRate,
  readRate,
  loading,
}: PercentDashboardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      {loading ? (
        [1, 2].map((_, i) => (
          <Card key={i} className="border border-gray-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-36" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-full rounded" />
            </CardContent>
          </Card>
        ))
      ) : (
        <>
          <PercentCard
            title="Taxa de Entrega"
            percentage={deliveryRate ?? 0}
            color="#2196F3"
          />
          <PercentCard
            title="Taxa de Leitura"
            percentage={readRate ?? 0}
            color="#FFC107"
          />
        </>
      )}
    </div>
  );
}
