/**
 * Path utilities for handling basePath in Next.js applications
 * 
 * Next.js basePath is configured in next.config.ts and affects:
 * - All routes (pages, API routes)
 * - Asset URLs
 * - Redirects (handled automatically by Next.js redirect())
 * 
 * However, client-side fetch() calls need to explicitly include basePath
 * for API routes, and we need utilities to normalize paths.
 */

/**
 * Get the basePath from environment variable
 * This matches the basePath in next.config.ts
 */
export function getBasePath(): string {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable
    return process.env.NEXT_PUBLIC_BASE_PATH || ''
  }
  // Client-side: use environment variable (injected at build time)
  return process.env.NEXT_PUBLIC_BASE_PATH || ''
}

/**
 * Add basePath to a path if basePath is configured
 * Use this for client-side fetch() calls to API routes
 * 
 * @example
 * apiUrl('/api/auth/signup') // Returns '/exbrain/api/auth/signup' if basePath is '/exbrain'
 */
export function apiUrl(path: string): string {
  const basePath = getBasePath()
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return basePath ? `${basePath}${normalizedPath}` : normalizedPath
}

/**
 * Add basePath to an app route path
 * Use this for constructing URLs to app pages (not API routes)
 * 
 * @example
 * appUrl('/dashboard/home') // Returns '/exbrain/dashboard/home' if basePath is '/exbrain'
 */
export function appUrl(path: string): string {
  const basePath = getBasePath()
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return basePath ? `${basePath}${normalizedPath}` : normalizedPath
}

/**
 * Remove basePath from a path if present
 * Use this when you have a path that might include basePath and need to normalize it
 * 
 * @example
 * withoutBasePath('/exbrain/dashboard/home') // Returns '/dashboard/home' if basePath is '/exbrain'
 */
export function withoutBasePath(path: string): string {
  const basePath = getBasePath()
  if (!basePath) return path
  if (path.startsWith(basePath)) {
    const without = path.slice(basePath.length)
    return without || '/'
  }
  return path
}

/**
 * Check if a path starts with basePath
 */
export function hasBasePath(path: string): boolean {
  const basePath = getBasePath()
  if (!basePath) return false
  return path.startsWith(basePath)
}

/**
 * Get default dashboard home path (with basePath)
 */
export function getDashboardHomePath(): string {
  return appUrl('/dashboard/home')
}
