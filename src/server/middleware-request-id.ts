/**
 * Next.js middleware helpers (Edge-safe): `X-Request-ID` response header + `x-request-id` cookie.
 * Matches hello-ui / exbrain-ui contract with `@exbrain/common-react/request-id` in the browser.
 *
 * Uses duck-typed request/response shapes (no `next` imports) so apps typecheck against their
 * own `next` dependency — avoids duplicate `NextRequest` / `NextResponse` when common-react
 * nests a different `node_modules/next`.
 *
 * Import from `@exbrain/common-react/server/middleware-request-id` so the middleware bundle
 * does not pull in Node-only modules (e.g. client log ingest).
 */

/** Incoming request with Headers (`NextRequest` satisfies this). */
export type RequestIdSource = {
  headers: {
    get(name: string): string | null;
  };
};

/** Response with mutable headers + Next.js-style `cookies.set` (`NextResponse` satisfies this). */
export type ResponseWithRequestIdCookie = {
  headers: {
    set(name: string, value: string): void;
  };
  cookies: {
    set(
      name: string,
      value: string,
      options?: {
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "lax" | "strict" | "none";
        maxAge?: number;
        path?: string;
      },
    ): void;
  };
};

/** Default cookie name; must match `REQUEST_ID_COOKIE_NAME` in `utils/requestId.ts`. */
export const DEFAULT_REQUEST_ID_COOKIE_NAME = "x-request-id";

/** Default cookie name for browser ID; must match `BROWSER_ID_COOKIE_NAME` in `utils/requestId.ts`. */
export const DEFAULT_BROWSER_ID_COOKIE_NAME = "x-browser-id";

function generateFallbackRequestId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function isValidUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Reads `x-request-id` / `X-Request-ID` from the incoming request, or generates a new UUID
 * when missing or not a valid UUID string.
 */
export function resolveRequestIdFromRequest(request: RequestIdSource): string {
  const raw =
    request.headers.get("x-request-id")?.trim() || request.headers.get("X-Request-ID")?.trim() || "";
  if (raw && isValidUuid(raw)) return raw;
  return generateFallbackRequestId();
}

export type ApplyRequestIdToNextResponseOptions = {
  /** Defaults to {@link DEFAULT_REQUEST_ID_COOKIE_NAME}. */
  cookieName?: string;
  maxAgeSeconds?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  /**
   * Cookie `Secure` flag. Hello-ui uses `process.env.NODE_ENV === "production"`;
   * exbrain-ui uses `request.nextUrl.protocol === "https:"`. Pass explicitly for your app.
   * @default false
   */
  secure?: boolean;
};

function parseCookieValue(cookieHeader: string, name: string): string {
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const cookieName = trimmed.slice(0, eq).trim();
    if (cookieName === name) {
      return trimmed.slice(eq + 1).trim();
    }
  }
  return "";
}

/**
 * Sets `X-Request-ID` on the response and the visible `x-request-id` cookie (httpOnly: false).
 * @returns The request ID applied (for optional edge logging).
 */
export function applyRequestIdToNextResponse(
  request: RequestIdSource,
  response: ResponseWithRequestIdCookie,
  options?: ApplyRequestIdToNextResponseOptions,
): string {
  const requestId = resolveRequestIdFromRequest(request);
  const cookieName = options?.cookieName ?? DEFAULT_REQUEST_ID_COOKIE_NAME;
  const maxAge = options?.maxAgeSeconds ?? 3600;
  const path = options?.path ?? "/";
  const secure = options?.secure ?? false;
  const sameSite = options?.sameSite ?? "lax";

  response.headers.set("X-Request-ID", requestId);
  response.cookies.set(cookieName, requestId, {
    httpOnly: false,
    secure,
    sameSite,
    maxAge,
    path,
  });
  return requestId;
}

/**
 * Sets `X-Browser-ID` on the response and the visible `x-browser-id` cookie (httpOnly: false).
 * Reads existing browser ID from the incoming Cookie header and reuses it if valid,
 * otherwise generates a new UUID. This is a stable observability correlator, not related to auth.
 * @returns The browser ID applied.
 */
export function applyBrowserIdToNextResponse(
  request: RequestIdSource,
  response: ResponseWithRequestIdCookie,
  options?: ApplyRequestIdToNextResponseOptions,
): string {
  const cookieName = options?.cookieName ?? DEFAULT_BROWSER_ID_COOKIE_NAME;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const existing = parseCookieValue(cookieHeader, cookieName);
  const browserId = existing && isValidUuid(existing) ? existing : generateFallbackRequestId();
  const maxAge = options?.maxAgeSeconds ?? 3600;
  const path = options?.path ?? "/";
  const secure = options?.secure ?? false;
  const sameSite = options?.sameSite ?? "lax";

  response.headers.set("X-Browser-ID", browserId);
  response.cookies.set(cookieName, browserId, {
    httpOnly: false,
    secure,
    sameSite,
    maxAge,
    path,
  });
  return browserId;
}
