'use client';

import { useSse } from './useSse';

export default function SimpleSessionStream() {
  const sessionId = 'cliente-whatsapp-01';
  const { data, error } = useSse(`/api/session/${sessionId}`);

  return (
    <div className="p-4">
      <h2>Eventos recebidos</h2>
      {error && <p className="text-red-600">{error}</p>}
      <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
