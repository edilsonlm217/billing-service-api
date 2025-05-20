export type SessionMode =
  | { type: 'listen'; sessionId: string }
  | { type: 'unavailable'; reason: string; sessionId: string }
  | { type: 'unauthorized'; reason: string; sessionId: string }