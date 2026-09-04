export interface N8NWebhookRequest {
  query: string;
  sessionId: string;
}

export interface N8NWebhookResponse {
  success?: boolean;
  answer: string;
  timestamp?: string;
  [key: string]: unknown;
}

export type ConnectionStatusType = 'idle' | 'testing' | 'connected' | 'offline';

export interface BackendStatusState {
  status: ConnectionStatusType;
  message?: string;
  latencyMs?: number;
  lastChecked?: string;
  errorDetail?: string;
}
