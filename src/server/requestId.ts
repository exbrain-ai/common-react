/**
 * Get or create a request ID from headers.
 * Server-only utility.
 * Works with Web `Headers`, `HeadersInit`, or any object with `get` (e.g. `NextRequest.headers`).
 *
 * Does not import from `next` so consumers resolve a single `next` install (see hello-ui Dockerfile:
 * common-react must not ship nested `node_modules/next`).
 */
export function getOrCreateRequestId(
  headers: Headers | HeadersInit | { get: (name: string) => string | null },
): string {
  let existingId: string | null = null;

  if (headers instanceof Headers) {
    existingId = headers.get("X-Request-ID");
  } else if (
    headers &&
    typeof headers === "object" &&
    "get" in headers &&
    typeof (headers as { get: (name: string) => string | null }).get === "function"
  ) {
    existingId = (headers as { get: (name: string) => string | null }).get("X-Request-ID");
  } else {
    const headersObj = new Headers(headers as HeadersInit);
    existingId = headersObj.get("X-Request-ID");
  }

  if (existingId) {
    return existingId;
  }

  return crypto.randomUUID();
}
