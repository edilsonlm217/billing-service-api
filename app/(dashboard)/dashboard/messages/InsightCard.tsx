import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  color: string;
}

export default function InsightCard({ icon, title, value, description, color }: InsightCardProps) {
  return (
    <Card className="border border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-extrabold" style={{ color }}>{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}