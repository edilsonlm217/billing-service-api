import { RecentMessage } from "./recent-message";

export type SessionConnectionStatus =
  | 'starting'
  | 'awaiting-qr-code-reading'
  | 'qr-timeout'
  | 'close'
  | 'restarting'
  | 'open'
  | 'logged-out';

export interface SessionCreds {
  contact?: {
    id: string;
    name?: string;
    notify?: string;
    verifiedName?: string;
    // Outros campos do Contact se necessário
  };
  phonePlatform?: string;
}

export interface SessionState {
  sessionId: string;
  status: SessionConnectionStatus;
  qrCode: string | null;
  creds: SessionCreds | null;
  lastUpdated: string; // Date no backend → string (ISO) no frontend
}

export interface DashboardApiResponse {
  totalMessages: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalError: number;
  totalPending: number;
  deliveryRate: number;
  readRate: number;
  errorRate: number;
  pendingRate: number;
  undeliveredMessages: number;
  deliveredButUnreadMessages: number;
  recentMessages: RecentMessage[];
  sessionState: SessionState | null;
}
