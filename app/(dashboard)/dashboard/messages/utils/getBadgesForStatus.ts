export type BadgeIconName = 'check' | 'eye' | 'alert' | 'error' | 'unknown';

export interface BadgeInfo {
  text: string;
  icon: BadgeIconName;
  colorClass: string;
  borderClass: string;
}

const badgeDefinitions: Record<string, BadgeInfo> = {
  Enviada: {
    text: 'Enviada',
    icon: 'check',
    colorClass: 'text-green-600',
    borderClass: 'border-green-600',
  },
  Entregue: {
    text: 'Entregue',
    icon: 'check',
    colorClass: 'text-blue-600',
    borderClass: 'border-blue-600',
  },
  Lida: {
    text: 'Lida',
    icon: 'eye',
    colorClass: 'text-yellow-600',
    borderClass: 'border-yellow-600',
  },
  Pendente: {
    text: 'Pendente',
    icon: 'alert',
    colorClass: 'text-yellow-600',
    borderClass: 'border-yellow-600',
  },
  Erro: {
    text: 'Erro',
    icon: 'error',
    colorClass: 'text-red-600',
    borderClass: 'border-red-600',
  },
  Desconhecido: {
    text: 'Desconhecido',
    icon: 'unknown',
    colorClass: 'text-gray-600',
    borderClass: 'border-gray-600',
  },
};

export function getBadgesForStatus(status: number): BadgeInfo[] {
  switch (status) {
    case 0:
      return [badgeDefinitions.Erro];
    case 1:
      return [badgeDefinitions.Pendente];
    case 2:
      return [badgeDefinitions.Enviada];
    case 3:
      return [badgeDefinitions.Enviada, badgeDefinitions.Entregue];
    case 4:
      return [badgeDefinitions.Enviada, badgeDefinitions.Entregue, badgeDefinitions.Lida];
    default:
      return [badgeDefinitions.Desconhecido];
  }
}
