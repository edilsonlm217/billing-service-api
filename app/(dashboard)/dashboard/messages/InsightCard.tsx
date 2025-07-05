import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  color: string;
  loading?: boolean;
}

export default function InsightCard({
  icon,
  title,
  value,
  description,
  color,
  loading = false,
}: InsightCardProps) {
  return (
    <Card className="border border-gray-300">
      <CardHeader>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="w-2/3 h-4" />
            <Skeleton className="w-1/3 h-3" />
          </div>
        ) : (
          <CardTitle className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            {icon} {title}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="w-16 h-10 rounded-md" />
            <div className="space-y-1">
              <Skeleton className="w-full h-3 rounded" />
              <Skeleton className="w-5/6 h-3 rounded" />
              <Skeleton className="w-4/6 h-3 rounded" />
            </div>
          </div>
        ) : (
          <>
            <p className="text-4xl font-extrabold" style={{ color }}>{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </>
        )}
      </CardContent>

    </Card>
  );
}
