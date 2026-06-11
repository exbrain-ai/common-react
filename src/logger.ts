/**
 * Server-safe logging entry — subpath `@exbrain/common-react/logger`.
 *
 * Re-exports the structured logger AND the context logger without importing any
 * React component modules (unlike the package barrel `src/index.ts`, which
 * re-exports `useState`-bearing components). Server Components (Next.js App
 * Router) and other non-React contexts can import logging from here without the
 * barrel's RSC build hazard.
 *
 * This file is both the type source (`tsc` -> dist/logger.d.ts) and the bundle
 * entry (vite -> dist/logger.esm.js / dist/logger.cjs.js), so the runtime and
 * the declarations stay in lockstep.
 */
export {
  default,
  // Named alias so consumers can `import { logger }` from the subpath, matching
  // the package barrel's `export { default as logger }`.
  default as logger,
  LOG_SCHEMA_FIELDS,
  patchConsoleForStructuredLogging,
  enableLogShipping,
  disableLogShipping,
  isLogShippingEnabled,
} from './utils/logger';
export type { Logger, LogLevel, PatchConsoleOptions } from './utils/logger';

export { createContextLogger } from './utils/context-logger';
export type { ContextLogger } from './utils/context-logger';
