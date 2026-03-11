/**
 * Shared URL/origin constants for auth and environment checks.
 * Single place to change scheme or localhost patterns.
 */

/** URL scheme for HTTPS (used for secure-origin checks). */
export const URL_SCHEME_HTTPS = 'https://';

/** Origin prefix for localhost (HTTP, used for secure-origin checks). */
export const ORIGIN_PREFIX_LOCALHOST = 'http://localhost';

/** Origin prefix for 127.0.0.1 (HTTP, used for secure-origin checks). */
export const ORIGIN_PREFIX_127 = 'http://127.0.0.1';

/** Hostname for localhost (used for environment detection). */
export const DEV_HOST_LOCALHOST = 'localhost';

/** Hostname for 127.0.0.1 (used for environment detection). */
export const DEV_HOST_127 = '127.0.0.1';
