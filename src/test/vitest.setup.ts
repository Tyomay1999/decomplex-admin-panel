import { vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";

beforeEach(() => {
  const c = globalThis.crypto as Crypto | undefined;

  if (!c || typeof c.randomUUID !== "function") {
    Object.defineProperty(globalThis, "crypto", {
      value: { randomUUID: vi.fn(() => "test-uuid") },
      configurable: true,
    });
    return;
  }

  vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("test-uuid");
});
