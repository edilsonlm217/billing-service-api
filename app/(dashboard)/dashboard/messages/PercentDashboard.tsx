import { PercentCard } from "./PercentCards";

interface PercentDashboardProps {
  deliveryRate: number;
  readRate: number;
}

export default function PercentDashboard({
  deliveryRate,
  readRate,
}: PercentDashboardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      <PercentCard
        title="Taxa de Entrega"
        percentage={deliveryRate}
        color="#2196F3"
      />
      <PercentCard
        title="Taxa de Leitura"
        percentage={readRate}
        color="#FFC107"
      />
    </div>
  );
}