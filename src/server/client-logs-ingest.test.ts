import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createClientLogsPostHandler } from "./client-logs-ingest";

describe("createClientLogsPostHandler", () => {
  const POST = createClientLogsPostHandler({ service: "test-ui" });

  let writeSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(() => {
    writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    writeSpy?.mockRestore();
  });

  it("returns 200 when body has requestId and logs array", async () => {
    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: "req-1",
        logs: [{ level: "info", message: "test" }],
        url: "http://localhost/",
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns 200 using X-Request-ID header when body has no requestId", async () => {
    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": "header-id",
      },
      body: JSON.stringify({ logs: [], url: "" }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns 400 when body is invalid JSON", async () => {
    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      body: "not json",
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
