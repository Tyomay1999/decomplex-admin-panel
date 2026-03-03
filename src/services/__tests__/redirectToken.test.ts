import { describe, it, expect, vi, beforeEach } from "vitest";

const setAccessTokenCookieMock = vi.fn();

vi.mock("@/services", () => ({
  setAccessTokenCookie: (t: string, days?: number) => {
    void days;
    setAccessTokenCookieMock(t);
  },
}));

type Subject = { hydrateAccessTokenFromUrl: () => string | null };

let subject: Subject;

describe("hydrateAccessTokenFromUrl", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    setAccessTokenCookieMock.mockClear();

    vi.resetModules();
    subject = await import("@/services/redirectToken");
  });

  it("hydrates token from query and cleans url", () => {
    const replaceState = vi.spyOn(window.history, "replaceState").mockImplementation(() => {
      return;
    });

    window.history.pushState({}, "", "/profile?accessToken=tok123&x=1#y=2");

    const token = subject.hydrateAccessTokenFromUrl();

    expect(token).toBe("tok123");
    expect(setAccessTokenCookieMock).toHaveBeenCalledTimes(1);
    expect(setAccessTokenCookieMock).toHaveBeenCalledWith("tok123");

    expect(replaceState).toHaveBeenCalledTimes(1);
    const thirdArg = replaceState.mock.calls[0]?.[2];
    expect(thirdArg).toBe("/profile?x=1#y=2");
  });

  it("hydrates token from hash and cleans url", () => {
    const replaceState = vi.spyOn(window.history, "replaceState").mockImplementation(() => {
      return;
    });

    window.history.pushState({}, "", "/profile?x=1#accessToken=tok999&y=2");

    const token = subject.hydrateAccessTokenFromUrl();

    expect(token).toBe("tok999");
    expect(setAccessTokenCookieMock).toHaveBeenCalledTimes(1);
    expect(setAccessTokenCookieMock).toHaveBeenCalledWith("tok999");

    expect(replaceState).toHaveBeenCalledTimes(1);
    const thirdArg = replaceState.mock.calls[0]?.[2];
    expect(thirdArg).toBe("/profile?x=1#y=2");
  });

  it("returns null when no token and does not mutate url", () => {
    const replaceState = vi.spyOn(window.history, "replaceState").mockImplementation(() => {
      return;
    });

    window.history.pushState({}, "", "/profile?x=1#y=2");

    const token = subject.hydrateAccessTokenFromUrl();

    expect(token).toBe(null);
    expect(setAccessTokenCookieMock).not.toHaveBeenCalled();
    expect(replaceState).not.toHaveBeenCalled();
  });
});
