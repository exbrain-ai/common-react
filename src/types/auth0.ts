/**
 * Auth0 Types for common-react
 */

/**
 * Auth0 configuration interface
 */
export interface Auth0Config {
  domain: string;
  clientId: string;
  audience?: string;
  redirectUri?: string;
  /**
   * Optional custom scope. If not provided, defaults to 'openid profile email offline_access'
   * The offline_access scope is required for refresh tokens.
   */
  scope?: string;
}

/**
 * Auth0 user information (from token)
 */
export interface Auth0User {
  sub: string; // Auth0 user ID (unique identifier)
  email?: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  [key: string]: unknown; // Allow custom claims
}

/**
 * Auth0 user with app-specific structure
 */
export interface User {
  id: string; // Auth0 sub
  email: string;
  name: string;
  picture?: string;
}

