'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

export function WhatsappPreview() {
  const [messageStep, setMessageStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const conversation = [
    { from: 'user', text: 'Olá! Gostaria de ativar o MK Messenger.' },
    { from: 'bot', text: 'Claro! Vamos começar criando sua conta gratuita.' },
    { from: 'bot', text: 'Você pode fazer isso acessando o link abaixo:' },
    { from: 'bot', text: 'https://staging.mk-messenger.com.br' },
    { from: 'user', text: 'Feito! E agora?' },
    { from: 'bot', text: 'Ótimo! Agora é só iniciar a sessão via QR code.' },
    { from: 'bot', text: 'Depois, gere sua chave de API e cole no MK-AUTH.' },
    { from: 'user', text: 'Super simples. Obrigado!' },
    { from: 'bot', text: 'Estamos juntos! Qualquer dúvida, chama aqui.' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessageStep((prev) =>
        prev < conversation.length - 1 ? prev + 1 : prev
      );
    }, 800);

    return () => clearTimeout(timer);
  }, [messageStep]);

  const copyToClipboard = () => {
    const text = conversation.map((msg) => `${msg.from === 'user' ? 'Você' : 'MK Messenger'}: ${msg.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden bg-white text-sm relative border border-gray-200">
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <button
          onClick={copyToClipboard}
          className="text-gray-500 hover:text-black transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-5 w-5" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="p-4 space-y-2 h-80 overflow-auto bg-green-50">
        {conversation.map((msg, index) =>
          index > messageStep ? null : (
            <div
              key={index}
              className={`max-w-xs px-4 py-2 rounded-lg ${msg.from === 'user'
                  ? 'bg-green-500 text-white ml-auto'
                  : 'bg-gray-200 text-gray-900 mr-auto'
                } transition-opacity duration-300`}
            >
              {msg.text}
            </div>
          )
        )}
      </div>
    </div>
  );
}
