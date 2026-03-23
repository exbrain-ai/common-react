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

  it("returns 200 using x-request-id header when body has no requestId and X-Request-ID absent", async () => {
    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-request-id": "  low-id  ",
      },
      body: JSON.stringify({
        logs: [{ level: "info", message: "ping" }],
        url: "",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(writeSpy).toHaveBeenCalled();
    const written = String(writeSpy?.mock.calls[0]?.[0] ?? "");
    expect(written).toContain('"request_id":"low-id"');
  });

  it("normalizes log entry message and merges object context", async () => {
    const req = new Request("http://localhost/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId: "r1",
        logs: [
          { level: "warn", message: 123, context: { extra: "x" } },
          { level: "info", message: "ok", context: null },
        ],
        url: "/page",
      }),
    });
    await POST(req);
    const lines = (writeSpy?.mock.calls ?? []).map((c) => String(c[0]));
    expect(lines.some((l) => l.includes('"message":"—"') && l.includes('"extra":"x"'))).toBe(true);
    expect(lines.some((l) => l.includes('"message":"ok"'))).toBe(true);
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
