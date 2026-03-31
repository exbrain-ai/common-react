/**
 * Server-side logger factory with request ID and optional tenant ID correlation.
 *
 * Safe for API routes and server components. NOT for client components or Edge Runtime.
 *
 * Usage (per-app server-logger.ts):
 *   import { createServerLogger } from '@exbrain/common-react/server/server-logger';
 *   export const { withRequestContext, ...logger } = createServerLogger('my-service');
 *
 * In API routes:
 *   import { withRequestContext } from '@/lib/logging/server-logger';
 *   import { getOrCreateRequestId } from '@exbrain/common-react/server';
 *   const log = withRequestContext(getOrCreateRequestId(request.headers), tenantId);
 *   log.info('User action', { user_id: userId, operation: 'create' });
 *
 * @param service - Service name written to every log entry (e.g. 'hello-ui', 'exbrain-ui')
 */

// Use the dedicated /logger export path (avoids importing React components from main index).
// @ts-expect-error - TypeScript resolves the compiled dist via package.json exports at runtime.
import logger, { LOG_SCHEMA_FIELDS } from '../utils/logger';
import { registerLogger } from './log-level-manager';

// Register the pino logger instance with the log-level-manager once at module load.
// This ensures setLogLevel() in the manager propagates to the pino instance.
registerLogger(logger);

export function createServerLogger(service: string) {
  /**
   * Returns a scoped logger pre-filled with request_id and (optionally) tenant_id.
   *
   * @param requestId - X-Request-ID from the incoming request
   *                    (use getOrCreateRequestId(request.headers) from @exbrain/common-react/server)
   * @param tenantId  - Active tenant ID (multi-tenant apps); omit for single-tenant apps
   */
  function withRequestContext(
    requestId: string | null | undefined,
    tenantId?: string | null | undefined,
  ) {
    const rid = requestId ?? '';
    const baseContext: Record<string, unknown> = {
      [LOG_SCHEMA_FIELDS.request_id]: rid,
      [LOG_SCHEMA_FIELDS.service]: service,
    };
    if (tenantId) {
      baseContext['tenant_id'] = tenantId;
    }
    return {
      debug: (message: string, context?: Record<string, unknown>) =>
        logger.debug(message, { ...context, ...baseContext }),
      info: (message: string, context?: Record<string, unknown>) =>
        logger.info(message, { ...context, ...baseContext }),
      warn: (message: string, context?: Record<string, unknown>) =>
        logger.warn(message, { ...context, ...baseContext }),
      error: (message: string, context?: Record<string, unknown>) =>
        logger.error(message, { ...context, ...baseContext }),
      setLevel: logger.setLevel.bind(logger),
      getLevel: logger.getLevel.bind(logger),
    };
  }

  return {
    withRequestContext,
    // Expose base logger for startup logs and other non-request-scoped use.
    debug: (message: string, context?: Record<string, unknown>) => logger.debug(message, context),
    info: (message: string, context?: Record<string, unknown>) => logger.info(message, context),
    warn: (message: string, context?: Record<string, unknown>) => logger.warn(message, context),
    error: (message: string, context?: Record<string, unknown>) => logger.error(message, context),
    setLevel: logger.setLevel.bind(logger),
    getLevel: logger.getLevel.bind(logger),
  };
}

// Export the raw logger as default so per-app files can do `import logger from '...'`.
export default logger;
