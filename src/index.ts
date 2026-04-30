/**
 * React Common Library
 * Shared components, utilities, and styles for React projects
 */

// Export all components
export { Button } from './components/Button';
export { FormField } from './components/FormField';
export { Input } from './components/Input';
export { StatusBanner } from './components/StatusBanner';
export { Table } from './components/Table';
export { Pagination, type PaginationProps } from './components/Pagination/Pagination';

// Export specialized components
export { GreetingForm, type GreetingFormData } from './components/GreetingForm';
export { StatsTable, type UserStats } from './components/StatsTable';

// Export environment indicator
export { EnvironmentBanner, detectEnvironment, type Environment } from './components/EnvironmentBanner';

// Export Auth0 components
export { AuthProvider } from './components/auth/AuthProvider';
export { AuthButton } from './components/auth/AuthButton';
export { ProtectedRoute } from './components/auth/ProtectedRoute';

// Export all utilities
export { default as logger, enableLogShipping, disableLogShipping, isLogShippingEnabled } from './utils/logger';
export type { Logger, LogLevel } from './utils/logger';
export { createContextLogger } from './utils/context-logger';
export type { ContextLogger } from './utils/context-logger';
export * from './utils/sanitizer';
export * from './utils/paths';
export * from './utils/email-validator';
export * from './utils/return-url-validator';
export * from './utils/password-validator';
export * from './utils/auth-error-mapper';
export * from './utils/auth-events';
export { cn } from './utils/cn';
export { safeTrim } from './utils/safe-trim';
export {
  getRequestId,
  getOrCreateClientRequestId,
  getRequestIdHeader,
  fetchWithRequestId,
  logOutgoingRequest,
  REQUEST_ID_COOKIE_NAME,
  REQUEST_ID_HEADER,
} from './utils/requestId';

// Responsive (SSR-safe viewport queries; align with Tailwind `screens`)
export * from './responsive';

// i18n (framework-neutral — no Next.js imports)
export {
  LOCALE_REGISTRY,
  type LocaleEntry,
  type SupportedLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  parseLocale,
  dirForLocale,
  langAttribute,
} from './utils/i18n';
export {
  type TranslationFn,
  type I18nContextValue,
  useI18n,
  I18nProvider,
  createFixtureI18n,
} from './utils/i18n-context';

// Export Auth0 service
export { useAuth0, getAccessToken } from './services/auth0';

// Export all types
export * from './types/common';
export * from './types/auth0';

