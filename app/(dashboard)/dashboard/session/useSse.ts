import { useEffect, useRef, useState } from 'react';

export function useSse<T = any>(url: string, options?: { retryDelay?: number }) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  const retryDelay = options?.retryDelay ?? 3000;

  useEffect(() => {
    const source = new EventSource(url);
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
        setError(null);
      } catch (err) {
        console.error('[useSse] Erro ao parsear:', err);
        setError('Erro ao interpretar os dados do stream');
      }
    };

    source.onerror = () => {
      console.warn('[useSse] Erro na conexão. Tentando reconectar...');
      source.close();

      if (reconnectRef.current) clearTimeout(reconnectRef.current);

      reconnectRef.current = setTimeout(() => {
        setAttempts((prev) => prev + 1); // força reconexão
      }, retryDelay);
    };

    return () => {
      source.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [url, attempts]);

  return { data, error };
}
