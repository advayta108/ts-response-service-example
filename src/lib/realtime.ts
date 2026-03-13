/**
 * SSE-подписчики: один Set на весь процесс через globalThis.
 * Иначе Next/Turbopack может поднять несколько копий модуля —
 * broadcast() из API попадёт в «пустой» Set, а /api/events/stream — в другой → тосты не приходят.
 */
type Client = ReadableStreamDefaultController<Uint8Array>;

const G = globalThis as unknown as { __requestEventsClients?: Set<Client> };
if (!G.__requestEventsClients) G.__requestEventsClients = new Set();
const clients = G.__requestEventsClients;

export function sseSubscribe(c: Client) {
  clients.add(c);
  return () => {
    clients.delete(c);
  };
}

export function broadcast(payload: Record<string, unknown>) {
  const line = `data: ${JSON.stringify(payload)}\n\n`;
  const buf = new TextEncoder().encode(line);
  for (const c of clients) {
    try {
      c.enqueue(buf);
    } catch {
      clients.delete(c);
    }
  }
}
