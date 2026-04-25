import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("dedupes conflicting tailwind classes (twMerge)", () => {
    // tailwind-merge: later padding token wins
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("filters falsy values (clsx)", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("supports conditional object syntax (clsx)", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });
});
