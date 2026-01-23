import { NextRequest } from 'next/server'

/**
 * Get or create a request ID from headers.
 * Server-only utility.
 * Works with NextRequest headers or Headers/HeadersInit.
 */
export function getOrCreateRequestId(
  headers: NextRequest['headers'] | Headers | HeadersInit
): string {
  let existingId: string | null = null
  
  if (headers instanceof Headers) {
    existingId = headers.get('X-Request-ID')
  } else if (headers && typeof headers === 'object' && 'get' in headers && typeof (headers as any).get === 'function') {
    // NextRequest headers
    existingId = (headers as any).get('X-Request-ID')
  } else {
    // HeadersInit (plain object or array)
    const headersObj = new Headers(headers as HeadersInit)
    existingId = headersObj.get('X-Request-ID')
  }
  
  if (existingId) {
    return existingId
  }
  
  // Generate a new request ID
  return crypto.randomUUID()
}
