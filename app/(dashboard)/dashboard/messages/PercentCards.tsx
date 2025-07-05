import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCountUp } from './hooks/useCountUp';

interface PercentCardProps {
  title: string;
  percentage: number; // 0-100
  color: string;
}

export function PercentCard({ title, percentage, color }: PercentCardProps) {
  const [target, setTarget] = useState(0);
  const animatedPercentage = useCountUp(target);

  useEffect(() => {
    setTarget(percentage);
  }, [percentage]);

  return (
    <Card className="border border-gray-300">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-extrabold text-gray-900">
            {animatedPercentage.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">dos totais</span>
        </div>
        <div className="w-full h-3 mt-3 rounded bg-gray-200 overflow-hidden">
          <div
            className="h-3 rounded"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
