/**
 * Authentication Error Mapper
 *
 * Maps IAM Service error codes to user-friendly error messages.
 * Implements error code mapping as specified in design.md.
 */

import { AUTH_ERROR_MESSAGES, MSG_AUTH_DEFAULT } from '../lib/messages'

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
    return defaultMessage ?? MSG_AUTH_DEFAULT
  }
  return AUTH_ERROR_MESSAGES[errorCode] ?? defaultMessage ?? MSG_AUTH_DEFAULT
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
