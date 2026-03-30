import { describe, it, expect, vi } from "vitest";

import {
  applyRequestIdToNextResponse,
  applyBrowserIdToNextResponse,
  resolveRequestIdFromRequest,
  DEFAULT_REQUEST_ID_COOKIE_NAME,
  DEFAULT_BROWSER_ID_COOKIE_NAME,
} from "./middleware-request-id";

describe("middleware-request-id", () => {
  it("resolveRequestIdFromRequest uses valid incoming header", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const req = new Request("http://localhost/", {
      headers: { "X-Request-ID": id },
    });
    expect(resolveRequestIdFromRequest(req)).toBe(id);
  });

  it("resolveRequestIdFromRequest prefers x-request-id casing", () => {
    const id = "650e8400-e29b-41d4-a716-446655440001";
    const req = new Request("http://localhost/", {
      headers: { "x-request-id": id },
    });
    expect(resolveRequestIdFromRequest(req)).toBe(id);
  });

  it("resolveRequestIdFromRequest generates when header invalid", () => {
    const req = new Request("http://localhost/", {
      headers: { "X-Request-ID": "not-a-uuid" },
    });
    const rid = resolveRequestIdFromRequest(req);
    expect(rid).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("resolveRequestIdFromRequest uses non-UUID fallback when crypto.randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", { randomUUID: undefined });
    try {
      const req = new Request("http://localhost/");
      const rid = resolveRequestIdFromRequest(req);
      expect(rid).toMatch(/^req-\d+-[a-z0-9]+$/i);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("applyBrowserIdToNextResponse generates new ID when no cookie present", () => {
    const req = new Request("http://localhost/");
    const headers = new Headers();
    const setSpy = vi.fn();
    const res = { headers, cookies: { set: setSpy } };
    const id = applyBrowserIdToNextResponse(req, res, { secure: true });
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(headers.get("X-Browser-ID")).toBe(id);
    expect(setSpy).toHaveBeenCalledWith(
      DEFAULT_BROWSER_ID_COOKIE_NAME,
      id,
      expect.objectContaining({ httpOnly: false, secure: true }),
    );
  });

  it("applyBrowserIdToNextResponse reuses valid existing cookie", () => {
    const existing = "550e8400-e29b-41d4-a716-446655440000";
    const req = new Request("http://localhost/", {
      headers: { cookie: `x-browser-id=${existing}` },
    });
    const headers = new Headers();
    const setSpy = vi.fn();
    const res = { headers, cookies: { set: setSpy } };
    const id = applyBrowserIdToNextResponse(req, res);
    expect(id).toBe(existing);
    expect(headers.get("X-Browser-ID")).toBe(existing);
  });

  it("applyBrowserIdToNextResponse generates new ID when cookie is invalid UUID", () => {
    const req = new Request("http://localhost/", {
      headers: { cookie: "x-browser-id=not-a-uuid" },
    });
    const headers = new Headers();
    const setSpy = vi.fn();
    const res = { headers, cookies: { set: setSpy } };
    const id = applyBrowserIdToNextResponse(req, res);
    expect(id).not.toBe("not-a-uuid");
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("applyRequestIdToNextResponse sets header and cookie", () => {
    const req = new Request("http://localhost/");
    const headers = new Headers();
    const setSpy = vi.fn();
    const res = {
      headers,
      cookies: { set: setSpy },
    };
    const id = applyRequestIdToNextResponse(req, res, { secure: false });
    expect(headers.get("X-Request-ID")).toBe(id);
    expect(setSpy).toHaveBeenCalledWith(
      DEFAULT_REQUEST_ID_COOKIE_NAME,
      id,
      expect.objectContaining({
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 3600,
        path: "/",
      }),
    );
  });
});
