'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SessionState = {
  sessionId: string;
  status: 'connecting' | 'open' | 'close' | 'logged-out';
  qrCode: string | null;
  creds: {
    contact?: { id: string; name: string };
    phonePlatform?: string;
  } | null;
  lastUpdated: string;
};

export default function SessionPage() {
  const sessionId = 'cliente-whatsapp-01'; // ajustar conforme necessário
  const [session, setSession] = useState<SessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamConnected, setStreamConnected] = useState(false);

  useEffect(() => {
    let evtSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isUnmounted = false;

    function connectStream() {
      evtSource = new EventSource(`/sessions/${sessionId}/stream`);

      evtSource.onopen = () => {
        if (isUnmounted) return;
        setStreamConnected(true);
        setLoading(false);
        setError(null);
      };

      evtSource.onmessage = (event) => {
        if (isUnmounted) return;
        try {
          const data = JSON.parse(event.data) as SessionState;
          setSession(data);
          setError(null);
        } catch {
          setError('Erro ao interpretar dados da sessão');
        }
      };

      evtSource.onerror = () => {
        if (isUnmounted) return;
        setError('Conexão perdida. Tentando reconectar...');
        setStreamConnected(false);
        evtSource?.close();

        // Reconnect após 5s
        reconnectTimeout = setTimeout(() => {
          if (!isUnmounted) {
            connectStream();
          }
        }, 5000);
      };
    }

    async function startSession() {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(`/sessions/${sessionId}/start`, { method: 'POST' });

        if (!resp.ok) {
          const errorText = await resp.text();
          throw new Error(`Erro ao iniciar sessão: ${errorText}`);
        }

        connectStream();
      } catch (err: any) {
        setError(err.message || 'Erro inesperado');
        setLoading(false);
      }
    }

    startSession();

    return () => {
      isUnmounted = true;
      if (evtSource) evtSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [sessionId]);


  function renderContent() {
    if (loading) {
      return <p>Iniciando sessão...</p>;
    }

    if (error) {
      return <p className="text-red-600">{error}</p>;
    }

    if (!session) {
      return <p>Aguardando dados da sessão...</p>;
    }

    const { status, qrCode, creds, sessionId } = session;

    if (status === 'connecting') {
      if (qrCode) {
        return (
          <div className="flex flex-col items-center gap-4">
            <p>Escaneie o QR Code para autenticar</p>
            <img src={qrCode} alt="QR Code de autenticação" className="max-w-xs" />
          </div>
        );
      }
      return <p>Conectando, aguardando QR Code...</p>;
    }

    if (status === 'open') {
      if (creds?.contact) {
        return (
          <>
            <p><strong>ID da Sessão:</strong> {sessionId}</p>
            <p><strong>Usuário:</strong> {creds.contact.name}</p>
            <p><strong>Plataforma:</strong> {creds.phonePlatform ?? 'Desconhecida'}</p>
          </>
        );
      }
      return (
        <>
          <p><strong>ID da Sessão:</strong> {sessionId}</p>
          <p>Aguardando informações do usuário...</p>
        </>
      );
    }

    if (status === 'close') {
      if (creds?.contact) {
        return (
          <>
            <p><strong>Sessão fechada</strong></p>
            <p><strong>Último usuário:</strong> {creds.contact.name}</p>
            <p><strong>Plataforma:</strong> {creds.phonePlatform ?? 'Desconhecida'}</p>
          </>
        );
      }
      return <p>Sessão fechada, sem dados do usuário.</p>;
    }

    if (status === 'logged-out') {
      if (creds?.contact) {
        return (
          <>
            <p><strong>Sessão finalizada</strong></p>
            <p><strong>Último usuário desconectado:</strong> {creds.contact.name}</p>
            <p><strong>Plataforma:</strong> {creds.phonePlatform ?? 'Desconhecida'}</p>
          </>
        );
      }
      return <p>Sessão finalizada, usuário desconectado.</p>;
    }

    return <p>Estado desconhecido.</p>;
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">Minha Sessão</h1>
      <Card>
        <CardHeader>
          <CardTitle>Status da Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </section>
  );
}
