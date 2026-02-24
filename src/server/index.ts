/**
 * @exbrain/common-react/server
 * 
 * Shared server-only utilities for Next.js applications.
 * 
 * IMPORTANT: This package must NOT be imported in client components.
 * All utilities are designed for server-side use only (route handlers, server components, server actions).
 */

export { getOrCreateRequestId } from './requestId'
export { fetchWithTimeout, REQUEST_ID_HEADER, type FetchWithTimeoutOptions } from './fetcher'
export { setCookie, getCookie, deleteCookie, getCookies } from './cookies'
export type { CookieOptions } from './cookies'
