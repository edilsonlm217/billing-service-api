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
  const sessionId = 'cliente-whatsapp-01'; // ajustar conforme necessário
  const [session, setSession] = useState<SessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamConnected, setStreamConnected] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null); // Novo estado para status do stream

  useEffect(() => {
    let evtSource: EventSource | null = null;

    function listenToStream() {
      console.log('[listenToStream] Tentando conectar ao SSE /api/session/' + sessionId);

      return new Promise<void>((resolve, reject) => {
        evtSource = new EventSource(`/api/session/${sessionId}`);

        evtSource.onopen = () => {
          console.log('[EventSource] Conexão aberta');
          setStreamConnected(true);
          setLoading(false);
          setError(null);
          setStreamStatus(null); // Limpa status de erro da conexão ao abrir
          resolve();
        };

        evtSource.onmessage = (event) => {
          console.log('[EventSource] Mensagem recebida:', event.data);

          try {
            const data = JSON.parse(event.data);
            console.log('[EventSource] Parsed data:', data);
            setSession(data.state);
            setError(null);
          } catch (err) {
            console.error('[EventSource] Erro ao interpretar dados da sessão:', err);
            setError('Erro ao interpretar dados da sessão');
          }
        };

        evtSource.onerror = (err) => {
          console.error('[EventSource] Erro ou desconexão:', err);

          if (evtSource?.readyState === EventSource.CLOSED) {
            setError('Conexão fechada pelo servidor.');
            setStreamConnected(false);
            setStreamStatus('Conexão fechada pelo servidor.');
            reject(new Error('Conexão fechada pelo servidor.'));
          } else {
            setError('Conexão perdida. Tentando reconectar...');
            setStreamConnected(false);
            setStreamStatus('Conexão perdida. Tentando reconectar...');
            // Não rejeita para permitir retry automático do EventSource
          }
        };
      });
    }

    async function startOrListenSession() {
      setLoading(true);
      setError(null);
      setSession(null);
      setStreamStatus(null);

      try {
        await listenToStream();
      } catch (e) {
        console.log('[startOrListenSession] Não conseguiu escutar stream, vai criar a sessão', e);

        try {
          const resp = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });

          if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Erro ao iniciar sessão: ${text}`);
          }

          console.log('[startOrListenSession] Sessão criada com sucesso, tentando ouvir o stream novamente');

          if (evtSource) {
            evtSource.close();
          }
          await listenToStream();
        } catch (error: any) {
          console.error('[startOrListenSession] Erro ao criar sessão:', error);
          setError(error.message || 'Erro inesperado ao criar sessão');
          setLoading(false);
        }
      }
    }

    startOrListenSession();

    return () => {
      console.log('[useEffect] Cleanup: fechando EventSource');
      if (evtSource) {
        evtSource.close();
      }
    };
  }, [sessionId]);

  function renderContent() {
    if (loading) {
      return <p>Iniciando sessão...</p>;
    }

    if (error && !session) {
      // Mostra erro só se não houver sessão carregada, para não sobrepor mensagens do stream
      return <p className="text-red-600">{error}</p>;
    }

    if (!session) {
      return <p>Aguardando dados da sessão...</p>;
    }

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
          {/* Exibe status do stream, se existir */}
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
