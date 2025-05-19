type EmitFunction = (send: (data: any) => void) => () => void;

export function createSseStream(req: Request, emitFn: EmitFunction) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      const stop = emitFn(send);

      // Limpa quando o cliente desconectar
      req.signal.addEventListener('abort', () => {
        stop?.();
        controller.close();
      });
    },
  });
}
