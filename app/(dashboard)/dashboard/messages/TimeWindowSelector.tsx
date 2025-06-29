'use client';

import { Button } from '@/components/ui/button';

interface TimeWindowOption {
  label: string;
  value: string;
}

interface TimeWindowSelectorProps {
  selectedWindow: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const TIME_WINDOWS: TimeWindowOption[] = [
  { label: 'Última 1 hora', value: '1h' },
  { label: 'Últimas 24 horas', value: '24h' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
];

export default function TimeWindowSelector({
  selectedWindow,
  onChange,
  disabled = false,
}: TimeWindowSelectorProps) {
  return (
    <div className="flex gap-4 mb-6">
      {TIME_WINDOWS.map(({ label, value }) => (
        <Button
          key={value}
          variant={selectedWindow === value ? 'default' : 'outline'}
          onClick={() => onChange(value)}
          disabled={disabled}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
