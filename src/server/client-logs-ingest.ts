/**
 * Next.js App Router `POST` handler for browser log batches (`@exbrain/common-react` logger shipper).
 * Writes one NDJSON line per entry to stdout for `ob logs` / Promtail / Loki.
 *
 * Uses standard `Request` / `Response` only (no `next` imports) so consuming apps typecheck
 * against their own `next` dependency — avoids duplicate `NextRequest` types when common-react
 * has a nested `node_modules/next`.
 *
 * Import from `@exbrain/common-react/server/client-logs-ingest` (Node route handlers only).
 */

export type ClientLogsIngestOptions = {
  /** Value for the `service` field in each NDJSON line (e.g. `hello-ui`, `exbrain-ui`). */
  service: string;
};

function writeNdjsonLine(obj: Record<string, unknown>): void {
  if (typeof process !== "undefined" && process.stdout?.writable) {
    process.stdout.write(JSON.stringify(obj) + "\n");
  }
}

/**
 * Returns a `POST` function suitable for `app/api/logs/route.ts`.
 * sendBeacon cannot set headers; `requestId` is taken from body or `X-Request-ID` / `x-request-id` headers.
 */
export function createClientLogsPostHandler(options: ClientLogsIngestOptions) {
  const { service } = options;

  return async function POST(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const requestId =
        (body.requestId as string)?.trim() ||
        request.headers.get("X-Request-ID")?.trim() ||
        request.headers.get("x-request-id")?.trim() ||
        (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "");
      const logs = Array.isArray(body.logs) ? body.logs : [];
      const url = typeof body.url === "string" ? body.url : "";
      const rid = requestId || "";

      for (const entry of logs) {
        const level = (entry?.level as string) || "info";
        const message = typeof entry?.message === "string" ? entry.message : "—";
        const context =
          typeof entry?.context === "object" && entry.context !== null
            ? (entry.context as Record<string, unknown>)
            : {};
        const line = {
          level,
          message,
          timestamp: new Date().toISOString(),
          service,
          request_id: rid,
          source: "browser",
          url,
          ...context,
        };
        writeNdjsonLine(line);
      }

      return Response.json({ success: true }, { status: 200 });
    } catch {
      return Response.json({ success: false }, { status: 400 });
    }
  };
}
