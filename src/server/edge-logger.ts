/**
 * Edge-safe logger factory for Next.js middleware (Edge Runtime).
 *
 * Uses only console.log + JSON — no pino, no Node APIs, no eval/code generation.
 * Schema fields match LOG_SCHEMA_FIELDS for Loki/Grafana correlation.
 *
 * Usage (per-app edge-logger.ts):
 *   import { createEdgeLogger } from '@exbrain/common-react/server/edge-logger';
 *   const { edgeLogRequest, edgeLogError } = createEdgeLogger('my-service');
 *   export { edgeLogRequest, edgeLogError };
 *
 * @param service - Service name written to every log entry (e.g. 'hello-ui', 'exbrain-ui')
 */
export function createEdgeLogger(service: string) {
  function log(level: string, requestId: string, message: string, context?: Record<string, unknown>): void {
    const line = JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      service,
      request_id: requestId,
      ...context,
    });
    if (level === 'error') {
      console.error(line);
    } else {
      console.log(line);
    }
  }

  return {
    /** Log an HTTP request at INFO level (call in middleware after assigning request_id). */
    edgeLogRequest(requestId: string, message: string, context?: Record<string, unknown>): void {
      log('info', requestId, message, context);
    },
    /** Log an error at ERROR level (middleware cannot use pino). */
    edgeLogError(requestId: string, message: string, context?: Record<string, unknown>): void {
      log('error', requestId, message, context);
    },
  };
}
