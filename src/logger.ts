/**
 * Logger export for server-side use
 * Re-exports the logger without importing React components
 */
export { default, LOG_SCHEMA_FIELDS, patchConsoleForStructuredLogging } from './utils/logger';
export type { Logger, LogLevel, PatchConsoleOptions } from './utils/logger';
