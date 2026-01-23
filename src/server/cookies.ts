import { cookies } from 'next/headers'

/**
 * Cookie helper utilities.
 * Server-only - must not be imported in client components.
 * 
 * @requires next/headers - Next.js 13+ App Router
 */

export interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  maxAge?: number
  path?: string
  domain?: string
}

const DEFAULT_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}

/**
 * Set a cookie value.
 */
export async function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(name, value, {
    ...DEFAULT_OPTIONS,
    ...options,
  })
}

/**
 * Get a cookie value.
 */
export async function getCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value || null
}

/**
 * Delete a cookie.
 * Note: Next.js cookies().delete() only accepts the cookie name.
 * The path/samesite/secure settings are determined by how the cookie was originally set.
 */
export async function deleteCookie(name: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(name)
}

/**
 * Get multiple cookies.
 */
export async function getCookies(names: string[]): Promise<Record<string, string | null>> {
  const cookieStore = await cookies()
  const result: Record<string, string | null> = {}
  
  for (const name of names) {
    result[name] = cookieStore.get(name)?.value || null
  }
  
  return result
}
