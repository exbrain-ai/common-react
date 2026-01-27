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
export { default as logger } from './utils/logger';
export type { Logger, LogLevel } from './utils/logger';
export * from './utils/sanitizer';
export * from './utils/paths';
export * from './utils/password-validator';
export * from './utils/auth-error-mapper';
export * from './utils/auth-events';
export { cn } from './utils/cn';

// Export Auth0 service
export { useAuth0, getAccessToken } from './services/auth0';

// Export all types
export * from './types/common';
export * from './types/auth0';

// Export styles
import './styles/index.css';
