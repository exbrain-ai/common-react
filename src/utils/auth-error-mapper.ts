/**
 * Authentication Error Mapper
 * 
 * Maps IAM Service error codes to user-friendly error messages.
 * Implements error code mapping as specified in design.md.
 */

export interface AuthError {
  code: string
  message: string
}

/**
 * Maps IAM Service error codes to user-friendly error messages
 * 
 * @param errorCode - Error code from IAM Service response
 * @param defaultMessage - Default error message if code is not recognized
 * @returns User-friendly error message
 */
export function mapAuthError(errorCode: string | undefined, defaultMessage?: string): string {
  if (!errorCode) {
    return defaultMessage || 'An error occurred. Please try again.'
  }

  const errorMap: Record<string, string> = {
    // Authentication errors
    invalid_credentials: 'Invalid email or password. Please check your credentials and try again.',
    invalid_email: 'Please enter a valid email address.',
    invalid_password: 'Password does not meet requirements. Please check the password policy.',
    
    // Signup errors
    user_already_exists: 'An account with this email already exists. Please sign in instead.',
    email_already_registered: 'An account with this email already exists. Please sign in instead.',
    
    // CSRF errors
    csrf_token_invalid: 'Security token expired. Please refresh the page and try again.',
    csrf_token_missing: 'Security token missing. Please refresh the page and try again.',
    csrf_token_expired: 'Security token expired. Please refresh the page and try again.',
    
    // Rate limiting errors
    rate_limit_exceeded: 'Too many attempts. Please wait a moment and try again.',
    
    // Account lockout errors
    account_locked: 'Account temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.',
    account_suspended: 'Your account has been suspended. Please contact support for assistance.',
    
    // Service errors
    service_unavailable: 'Authentication service is temporarily unavailable. Please try again in a moment.',
    internal_error: 'An unexpected error occurred. Please try again.',
    
    // Network errors
    network_error: 'Network error. Please check your connection and try again.',
    timeout: 'Request timed out. Please try again.',
  }

  return errorMap[errorCode] || defaultMessage || 'An error occurred. Please try again.'
}

/**
 * Extracts error code and message from API response
 * 
 * @param data - API response data
 * @returns Error code and message, or null if no error
 */
export function extractAuthError(data: unknown): { code: string; message: string } | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const error = (data as { error?: { code?: string; message?: string } | string }).error

  if (!error) {
    return null
  }

  if (typeof error === 'string') {
    return {
      code: 'unknown',
      message: error,
    }
  }

  if (typeof error === 'object' && error !== null) {
    const errorCode = error.code || 'unknown'
    const errorMessage = error.message || mapAuthError(errorCode)
    
    return {
      code: errorCode,
      message: mapAuthError(errorCode, errorMessage),
    }
  }

  return null
}
