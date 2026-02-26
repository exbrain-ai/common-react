/**
 * Unified log schema field names. Must match common-go/logger/schema.go
 * and arch/docs/UNIFIED_LOGGING.md so all services (hello-ui, hello-engine,
 * IAM, exbrain-accounts, exbrain-admin, etc.) emit consistent JSON for Grafana/LogQL.
 */
export const LOG_SCHEMA_FIELDS = {
  level: 'level',
  message: 'message',
  timestamp: 'timestamp',
  service: 'service',
  request_id: 'request_id',
} as const;

export type LogSchemaFieldName = keyof typeof LOG_SCHEMA_FIELDS;
