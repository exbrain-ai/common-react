/**
 * Fetch with timeout and automatic X-Request-ID forwarding.
 * Server-only utility.
 * 
 * If X-Request-ID is not already in options.headers, generates a new one.
 * Always includes X-Request-ID in outbound requests.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    // Ensure headers object exists
    const headers = new Headers(options.headers)
    
    // Forward or create X-Request-ID if not already set
    if (!headers.has('X-Request-ID')) {
      // Generate a new request ID for this outbound call
      const requestId = crypto.randomUUID()
      headers.set('X-Request-ID', requestId)
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })

    return response
  } finally {
    clearTimeout(timeoutId)
  }
}
