# Request ID (X-Request-ID) — React/Next.js

Use **X-Request-ID** on every request so gateway, IAM, and backends can correlate logs. This library provides client and server helpers so the same ID flows from UI → gateway → IAM → backend.

## Client-side (browser)

Use for **all** API calls (OpenAPI client and direct `fetch`).

```ts
import { getRequestIdHeader, fetchWithRequestId } from '@exbrain/common-react';

// 1. OpenAPI / generated client: set default headers so every call includes X-Request-ID
OpenAPI.HEADERS = async () => getRequestIdHeader();

// 2. Direct fetch: use fetchWithRequestId instead of fetch
const res = await fetchWithRequestId('/api/greetings', { method: 'POST', body: JSON.stringify(data) });
```

- **getRequestId()** – reads request ID from cookie (e.g. set by Next.js middleware); returns `''` on server or when unset.
- **getRequestIdHeader()** – returns `{ 'X-Request-ID': string }` from cookie or a new UUID. Use for OpenAPI default headers.
- **fetchWithRequestId(input, init?, cookieName?)** – like `fetch`, but merges in `X-Request-ID` (from cookie or new UUID).

Cookie name defaults to `x-request-id`; override with the third argument if your app uses another name.

## Server-side (Next.js API routes, server components)

When proxying to IAM or another backend, forward the incoming request ID and echo it in the response.

```ts
import { getOrCreateRequestId, fetchWithTimeout } from '@exbrain/common-react/server';

// In a route handler (NextRequest)
const requestId = getOrCreateRequestId(request.headers);
const response = await fetchWithTimeout(iamUrl, {
  method: 'GET',
  requestId,  // forwards X-Request-ID to IAM
  headers: { 'X-App-Name': 'hello' },
}, 10_000);

// Echo in response so client can correlate
return NextResponse.json(data, {
  headers: { 'X-Request-ID': requestId },
});
```

- **getOrCreateRequestId(headers)** – reads `X-Request-ID` from incoming headers or generates a new UUID. Use for every proxied call.
- **fetchWithTimeout(url, options, timeoutMs)** – `options.requestId` is forwarded as `X-Request-ID`; if omitted, a new UUID is used. Use for server-side fetch to IAM/engine.

## Full flow (Go + React)

See **common-go/docs/REQUEST_ID.md** for:

- Go services: `middleware.PropagateRequestID()`, logger, response, outbound headers
- Gateway: forwarding and optional access log
- End-to-end correlation

Adopt this pattern in **all apps** (Hello and others) so every endpoint and app uses the same request ID flow.
