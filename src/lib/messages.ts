/**
 * User-facing error and UI messages.
 * Single place for copy shown to users (auth errors, Auth0 fallbacks, etc.).
 */

// Auth0 / secure-origin fallbacks (when Auth0 is not available)
export const MSG_AUTH0_NOT_AVAILABLE_HTTP =
  'Auth0 is not available on HTTP (non-localhost). Use HTTPS or localhost.'
export const MSG_AUTH0_PROVIDER_NOT_AVAILABLE = 'Auth0Provider is not available'
export const MSG_MISSING_REFRESH_TOKEN =
  'Missing Refresh Token. Please clear your browser storage (localStorage) and log in again to obtain a refresh token.'

// Auth error mapper: default and code-to-message map
export const MSG_AUTH_DEFAULT = 'An error occurred. Please try again.'

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Invalid email or password. Please check your credentials and try again.',
  invalid_email: 'Please enter a valid email address.',
  invalid_password: 'Password does not meet requirements. Please check the password policy.',
  user_already_exists: 'An account with this email already exists. Please sign in instead.',
  email_already_registered: 'An account with this email already exists. Please sign in instead.',
  csrf_token_invalid: 'Security token expired. Please refresh the page and try again.',
  csrf_token_missing: 'Security token missing. Please refresh the page and try again.',
  csrf_token_expired: 'Security token expired. Please refresh the page and try again.',
  rate_limit_exceeded: 'Too many attempts. Please wait a moment and try again.',
  account_locked:
    'Account temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.',
  account_suspended: 'Your account has been suspended. Please contact support for assistance.',
  service_unavailable:
    'Authentication service is temporarily unavailable. Please try again in a moment.',
  internal_error: 'An unexpected error occurred. Please try again.',
  network_error: 'Network error. Please check your connection and try again.',
  timeout: 'Request timed out. Please try again.',
}
