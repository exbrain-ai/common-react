/**
 * Auth0 Service for common-react
 * 
 * Provides a clean wrapper around @auth0/auth0-react
 */

import { useAuth0 as useAuth0Base } from '@auth0/auth0-react';
import { ORIGIN_PREFIX_127, ORIGIN_PREFIX_LOCALHOST, URL_SCHEME_HTTPS } from '../lib/constants';
import {
  MSG_AUTH0_NOT_AVAILABLE_HTTP,
  MSG_AUTH0_PROVIDER_NOT_AVAILABLE,
  MSG_MISSING_REFRESH_TOKEN,
} from '../lib/messages';
import type { Auth0User } from '../types/auth0';
import { createContextLogger } from '../utils/context-logger';

// Structured logger for this service. Mirrors common-go/logger.NewContextLogger.
// SECURITY: only ever log error.message / a redacted summary here — never the raw
// Auth0 error object or the access token, both of which can embed credential material.
const log = createContextLogger('auth0Service');

/**
 * Redact an unknown error to a safe, loggable message.
 *
 * Auth0 SDK errors (and the values they wrap) can carry token material in
 * non-standard fields. We therefore only surface `error.message` for real Errors,
 * and a coarse type label otherwise — never the raw object and never any token.
 */
function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return `non-error value of type ${typeof error}`;
}

/**
 * Check if the current origin is secure (HTTPS or localhost)
 */
function isSecureOrigin(): boolean {
  if (typeof window === 'undefined') {
    return false; // SSR
  }
  const origin = window.location.origin;
  return (
    origin.startsWith(URL_SCHEME_HTTPS) ||
    origin.startsWith(ORIGIN_PREFIX_LOCALHOST) ||
    origin.startsWith(ORIGIN_PREFIX_127)
  );
}

/**
 * useAuth0 hook wrapper
 * Returns Auth0 context if available, otherwise returns a mock context for HTTP (non-localhost)
 */
export function useAuth0() {
  // If not on secure origin, return mock context
  if (!isSecureOrigin()) {
    return {
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      error: undefined,
      getAccessTokenSilently: async () => {
        throw new Error(MSG_AUTH0_NOT_AVAILABLE_HTTP);
      },
      getAccessTokenWithPopup: async () => {
        throw new Error(MSG_AUTH0_NOT_AVAILABLE_HTTP);
      },
      getIdTokenClaims: async () => undefined,
      loginWithRedirect: () => {
        log.warn(MSG_AUTH0_NOT_AVAILABLE_HTTP, { action: 'loginWithRedirect' });
      },
      loginWithPopup: async () => {
        throw new Error(MSG_AUTH0_NOT_AVAILABLE_HTTP);
      },
      logout: () => {
        log.warn(MSG_AUTH0_NOT_AVAILABLE_HTTP, { action: 'logout' });
      },
      handleRedirectCallback: async () => {
        throw new Error(MSG_AUTH0_NOT_AVAILABLE_HTTP);
      },
    };
  }
  
  // On secure origin, use real Auth0
  try {
    const auth0 = useAuth0Base();
    return {
      ...auth0,
      user: auth0.user as Auth0User | undefined,
    };
  } catch {
    // If Auth0Provider is not present on a secure origin, this is a genuine
    // misconfiguration (a component called useAuth0() outside an <AuthProvider>),
    // not an expected SSR/HTTP affordance. Surface it via the structured logger so
    // it is observable, then preserve the mock-context contract callers rely on.
    log.warn('Auth0Provider not found on secure origin, returning mock context');
    return {
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      error: undefined,
      getAccessTokenSilently: async () => {
        throw new Error(MSG_AUTH0_PROVIDER_NOT_AVAILABLE);
      },
      getAccessTokenWithPopup: async () => {
        throw new Error(MSG_AUTH0_PROVIDER_NOT_AVAILABLE);
      },
      getIdTokenClaims: async () => undefined,
      loginWithRedirect: () => {
        log.warn(MSG_AUTH0_PROVIDER_NOT_AVAILABLE, { action: 'loginWithRedirect' });
      },
      loginWithPopup: async () => {
        throw new Error(MSG_AUTH0_PROVIDER_NOT_AVAILABLE);
      },
      logout: () => {
        log.warn(MSG_AUTH0_PROVIDER_NOT_AVAILABLE, { action: 'logout' });
      },
      handleRedirectCallback: async () => {
        throw new Error(MSG_AUTH0_PROVIDER_NOT_AVAILABLE);
      },
    };
  }
}

/**
 * Get access token for API calls.
 *
 * Returns the access token, or `null` when a token cannot be obtained.
 *
 * Contract (relied on fleet-wide by every frontend that calls this): a `null`
 * return means "no usable token / not authenticated". We deliberately preserve
 * that contract rather than throwing, so callers can branch on `null` as before.
 * What changed for golden §1/§7: the failure is no longer silently swallowed —
 * every catch path is now logged via the structured logger so the auth failure is
 * observable. The only exception is the "Missing Refresh Token" case, which is
 * actionable by the user and is therefore surfaced as a thrown, user-facing error.
 *
 * SECURITY (§7): we never log the raw error object or the token. Auth0 SDK errors
 * can wrap credential material in non-standard fields, so only `safeErrorMessage`
 * (a redacted summary) is logged.
 */
export async function getAccessToken(
  getAccessTokenSilently: () => Promise<string>
): Promise<string | null> {
  try {
    return await getAccessTokenSilently();
  } catch (error) {
    const errorMessage = safeErrorMessage(error);
    // Handle missing refresh token error specifically — actionable by the user.
    if (errorMessage.includes('Missing Refresh Token')) {
      log.error(
        'Access token acquisition failed: missing refresh token. ' +
        'User must clear browser storage and log in again (offline_access scope required).',
        { reason: 'missing_refresh_token' }
      );
      // Suggest clearing storage and re-authenticating.
      throw new Error(MSG_MISSING_REFRESH_TOKEN);
    }
    // Any other failure: make it observable (was a silent swallow), then preserve
    // the null-return contract so existing callers behave unchanged.
    log.error('Failed to get access token', { reason: errorMessage });
    return null;
  }
}

