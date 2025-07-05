export interface RecentMessage {
  sessionId: string;
  messageId: string;
  to: string;
  content: string;
  sentAt: number;
  status: number;
}