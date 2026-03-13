import { sseSubscribe } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET() {
  let unsubscribe: (() => void) | undefined;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      unsubscribe = sseSubscribe(controller);
      controller.enqueue(new TextEncoder().encode(":ok\n\n"));
      const ping = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(":ping\n\n"));
        } catch {
          clearInterval(ping);
        }
      }, 25000);
      const cleanup = () => {
        clearInterval(ping);
        unsubscribe?.();
      };
      (controller as unknown as { _cleanup?: () => void })._cleanup = cleanup;
    },
    cancel() {
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
