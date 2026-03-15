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
        console.warn('Auth0 login is not available on HTTP (non-localhost). Use HTTPS or localhost.');
      },
      loginWithPopup: async () => {
        throw new Error(MSG_AUTH0_NOT_AVAILABLE_HTTP);
      },
      logout: () => {
        console.warn('Auth0 logout is not available on HTTP (non-localhost). Use HTTPS or localhost.');
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
    // If Auth0Provider is not present, return mock context
    console.warn('Auth0Provider not found, returning mock context');
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
        console.warn('Auth0Provider is not available');
      },
      loginWithPopup: async () => {
        throw new Error(MSG_AUTH0_PROVIDER_NOT_AVAILABLE);
      },
      logout: () => {
        console.warn('Auth0Provider is not available');
      },
      handleRedirectCallback: async () => {
        throw new Error(MSG_AUTH0_PROVIDER_NOT_AVAILABLE);
      },
    };
  }
}

/**
 * Get access token for API calls
 * Returns the access token, or null if not authenticated
 */
export async function getAccessToken(
  getAccessTokenSilently: () => Promise<string>
): Promise<string | null> {
  try {
    return await getAccessTokenSilently();
  } catch (error) {
    // Handle missing refresh token error specifically
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Missing Refresh Token')) {
      console.error(
        '❌ Missing Refresh Token: Please clear your browser storage and log in again. ' +
        'The refresh token is required for silent authentication. ' +
        'This usually happens if you logged in before the offline_access scope was enabled.'
      );
      // Suggest clearing storage and re-authenticating
      throw new Error(MSG_MISSING_REFRESH_TOKEN);
    }
    console.error('Failed to get access token:', error);
    return null;
  }
}

