export type SessionConnectionStatus =
  | 'connecting'
  | 'open'
  | 'close'
  | 'logged-out'
  | 'qr-timeout';

export interface SessionCreds {
  contact?: {
    id: string;
    lid?: string;
    name?: string;
  };
  phonePlatform?: string;
}

export interface SessionState {
  sessionId: string;
  status: SessionConnectionStatus;
  qrCode: string | null;
  creds: SessionCreds | null;
  lastUpdated: string; // cuidado que no SSE pode vir como string
}

export interface SessionSsePayload {
  state: SessionState;
}
