import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

describe("baseQuery prepareHeaders", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sets auth, language and fingerprint headers", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(null, { status: 200 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const baseQuery = fetchBaseQuery({
      baseUrl: "http://localhost/api",
      prepareHeaders: (headers) => {
        headers.set("Authorization", "Bearer cookie_token");
        headers.set("Accept-Language", "en");
        headers.set("X-Client-Fingerprint", "fp-123");
        return headers;
      },
    });

    await baseQuery({ url: "/test", method: "GET" }, {} as never, {} as never);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const firstArg = fetchMock.mock.calls[0]?.[0];
    const secondArg = fetchMock.mock.calls[0]?.[1];

    const headers =
      secondArg?.headers ?? (firstArg instanceof Request ? firstArg.headers : undefined);

    expect(headers).toBeTruthy();

    const h = headers as Headers;

    expect(h.get("Authorization")).toBe("Bearer cookie_token");
    expect(h.get("Accept-Language")).toBe("en");
    expect(h.get("X-Client-Fingerprint")).toBe("fp-123");
  });
});
