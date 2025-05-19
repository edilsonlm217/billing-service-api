import { EventSource } from 'eventsource';

type OnMessage = (data: any) => void;

interface ConnectOptions {
  url: string;
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  onMessage?: OnMessage;
  onClose?: () => void; // opcional
}

export function connectWithRetry({
  url,
  maxRetries = 5,
  retryDelayMs = 2000,
  timeoutMs = 10000,
  onMessage,
  onClose,
}: ConnectOptions): Promise<() => void> {
  let retries = 0;
  let es: EventSource | null = null;
  let timeoutHandle: NodeJS.Timeout;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      if (es) {
        es.close();
        es = null;
      }
      clearTimeout(timeoutHandle);
      if (onClose) onClose();
    };

    const tryConnect = () => {
      es = new EventSource(url);

      timeoutHandle = setTimeout(() => {
        cleanup();
        if (retries >= maxRetries) {
          reject(new Error('Timeout e esgotou tentativas de reconexão'));
        } else {
          retries++;
          setTimeout(tryConnect, retryDelayMs);
        }
      }, timeoutMs);

      es.onopen = () => {
        clearTimeout(timeoutHandle);
        retries = 0; // resetar contagem de tentativas após sucesso
        resolve(() => {
          cleanup();
        });
      };

      es.onerror = (err) => {
        cleanup();
        if (retries >= maxRetries) {
          reject(err);
        } else {
          retries++;
          setTimeout(tryConnect, retryDelayMs);
        }
      };

      es.onmessage = (event) => {
        if (onMessage) {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch {
            onMessage(event.data);
          }
        }
      };
    };

    tryConnect();
  });
}
