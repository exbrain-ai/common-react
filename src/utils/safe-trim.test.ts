import { describe, expect, it } from "vitest";

import { safeTrim } from "./safe-trim";

describe("safeTrim", () => {
  it("returns empty for null and undefined", () => {
    expect(safeTrim(null)).toBe("");
    expect(safeTrim(undefined)).toBe("");
  });

  it("trims strings", () => {
    expect(safeTrim("  hi  ")).toBe("hi");
    expect(safeTrim("")).toBe("");
  });

  it("stringifies and trims non-strings", () => {
    expect(safeTrim(42)).toBe("42");
    expect(safeTrim(0)).toBe("0");
  });
});
