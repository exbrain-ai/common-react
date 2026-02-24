/** Header name for request ID (must match gateway and backends). */
export const REQUEST_ID_HEADER = 'X-Request-ID'

export interface FetchWithTimeoutOptions extends RequestInit {
  /** Optional request ID to forward (e.g. from getOrCreateRequestId(incomingRequest.headers)). */
  requestId?: string
}

/**
 * Fetch with timeout and automatic X-Request-ID.
 * Server-only utility.
 *
 * - If options.requestId is provided, forwards it (e.g. from incoming request).
 * - Else if X-Request-ID is already in options.headers, keeps it.
 * - Otherwise generates a new UUID.
 * Use getOrCreateRequestId(request.headers) and pass as requestId when proxying to IAM/engine.
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const headers = new Headers(options.headers)
    const { requestId, ...restInit } = options

    if (requestId) {
      headers.set(REQUEST_ID_HEADER, requestId)
    } else if (!headers.has(REQUEST_ID_HEADER)) {
      headers.set(REQUEST_ID_HEADER, crypto.randomUUID())
    }

    const response = await fetch(url, {
      ...restInit,
      headers,
      signal: controller.signal,
    })

    return response
  } finally {
    clearTimeout(timeoutId)
  }
}
