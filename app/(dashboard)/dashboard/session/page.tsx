'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SessionState = {
  sessionId: string;
  status: 'connecting' | 'open' | 'close' | 'logged-out' | 'qr-timeout';
  qrCode: string | null;
  creds: {
    contact?: {
      id: string;
      lid?: string;
      name?: string;
    };
    phonePlatform?: string;
  } | null;
  lastUpdated: string;
};

export default function SessionPage() {
  const sessionId = 'cliente-whatsapp-01';
  const [session, setSession] = useState<SessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function listenToStream() {
      console.log('[listenToStream] Tentando conectar via fetch/ReadableStream');

      try {
        const res = await fetch(`/api/session/${sessionId}`, {
          headers: { Accept: 'text/event-stream' },
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Resposta inválida do servidor: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        setLoading(false);
        setStreamStatus(null);
        setError(null);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // mantém o que sobrou incompleto

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log('[Stream] Dados recebidos:', data);
                setSession(data.state);
              } catch (e) {
                console.warn('[Stream] Erro ao parsear linha:', e);
                setError('Erro ao interpretar dados da sessão.');
              }
            }
          }
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        console.error('[Stream] Erro geral:', e);
        setError('Conexão perdida com o servidor.');
        setStreamStatus('Conexão perdida. Tente recarregar.');
      }
    }

    async function startOrListenSession() {
      setLoading(true);
      setError(null);
      setSession(null);
      setStreamStatus(null);

      try {
        await listenToStream();
      } catch {
        console.log('[startOrListenSession] Stream falhou, tentando iniciar a sessão');

        try {
          const resp = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });

          if (!resp.ok) {
            const text = await resp.text();
            throw new Error(text);
          }

          console.log('[startOrListenSession] Sessão criada. Conectando stream...');
          await listenToStream();
        } catch (error: any) {
          console.error('[startOrListenSession] Falha ao criar sessão:', error);
          setError(error.message || 'Erro inesperado ao criar sessão');
          setLoading(false);
        }
      }
    }

    startOrListenSession();

    return () => {
      console.log('[Cleanup] Abortando stream');
      controller.abort();
    };
  }, [sessionId]);

  function renderContent() {
    if (loading) return <p>Iniciando sessão...</p>;
    if (error && !session) return <p className="text-red-600">{error}</p>;
    if (!session) return <p>Aguardando dados da sessão...</p>;

    const { status, qrCode, creds, sessionId, lastUpdated } = session;
    const contact = creds?.contact;

    const renderContato = () =>
      contact ? (
        <>
          <p><strong>Nome:</strong> {contact.name ?? 'Desconhecido'}</p>
          <p><strong>ID:</strong> {contact.id}</p>
          {contact.lid && <p><strong>LID:</strong> {contact.lid}</p>}
        </>
      ) : (
        <p>Sem dados do contato.</p>
      );

    switch (status) {
      case 'connecting':
        return qrCode ? (
          <div className="flex flex-col items-center gap-4">
            <p>Escaneie o QR Code para autenticar</p>
            <img src={qrCode} alt="QR Code de autenticação" className="max-w-xs" />
          </div>
        ) : (
          <p>Conectando, aguardando QR Code...</p>
        );
      case 'qr-timeout':
        return (
          <div className="text-center text-orange-600">
            <p>O tempo para escanear o QR Code expirou.</p>
            <p>Tente recarregar a página para gerar um novo código.</p>
          </div>
        );
      case 'open':
        return (
          <>
            <p><strong>ID da Sessão:</strong> {sessionId}</p>
            {renderContato()}
            <p><strong>Plataforma:</strong> {creds?.phonePlatform ?? 'Desconhecida'}</p>
            <p><strong>Atualizado em:</strong> {lastUpdated}</p>
          </>
        );
      case 'close':
        return (
          <>
            <p className="text-yellow-600"><strong>Sessão fechada</strong></p>
            {renderContato()}
            <p><strong>Plataforma:</strong> {creds?.phonePlatform ?? 'Desconhecida'}</p>
          </>
        );
      case 'logged-out':
        return (
          <>
            <p className="text-red-600"><strong>Sessão finalizada</strong></p>
            {renderContato()}
            <p><strong>Plataforma:</strong> {creds?.phonePlatform ?? 'Desconhecida'}</p>
          </>
        );
      default:
        return (
          <div className="text-gray-600">
            <p>Estado desconhecido: <code>{status}</code></p>
            <p><strong>Atualizado em:</strong> {lastUpdated}</p>
          </div>
        );
    }
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">Minha Sessão</h1>
      <Card>
        <CardHeader>
          <CardTitle>Status da Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          {streamStatus && (
            <div className="mb-4 p-2 text-center text-orange-600 border border-orange-300 rounded">
              {streamStatus}
            </div>
          )}
          {renderContent()}
        </CardContent>
      </Card>
    </section>
  );
}
