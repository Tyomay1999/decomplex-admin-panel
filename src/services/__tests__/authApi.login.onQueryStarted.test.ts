import { describe, it, expect, vi, beforeEach } from "vitest";

const setAccessTokenCookieMock = vi.fn();
const setRefreshTokenCookieMock = vi.fn();
const saveServerFingerprintMock = vi.fn();

const setTokenOnlyMock = vi.fn((p: { accessToken: string }) => ({
  type: "auth/setTokenOnly",
  payload: p,
}));

vi.mock("@/services/authHelpers", () => ({
  getOrCreateFingerprint: vi.fn(() => "fp"),
  saveServerFingerprint: (hash: string) => saveServerFingerprintMock(hash),
  setAccessTokenCookie: (t: string, days?: number) => setAccessTokenCookieMock(t, days),
  setRefreshTokenCookie: (t: string, days?: number) => setRefreshTokenCookieMock(t, days),
}));

vi.mock("@/features/auth/authSlice", () => ({
  setTokenOnly: (p: { accessToken: string }) => setTokenOnlyMock(p),
}));

vi.mock("@/services/baseQueryWithReauth", () => ({
  baseQueryWithReauth: vi.fn(),
}));

describe("onLoginQueryStarted", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("rememberUser=false → sets cookies (7 days) and dispatches setTokenOnly on success", async () => {
    const { onLoginQueryStarted } = await import("@/services/authApi");

    const dispatch = vi.fn((a: unknown) => a);

    const arg = {
      email: "a@b.com",
      password: "p",
      language: "en",
      rememberUser: false,
    };

    const queryFulfilled = Promise.resolve({
      data: {
        accessToken: "at",
        refreshToken: "rt",
        user: {} as never,
      },
    });

    await onLoginQueryStarted(arg, { dispatch, queryFulfilled });

    expect(setAccessTokenCookieMock).toHaveBeenCalledWith("at", 7);
    expect(setRefreshTokenCookieMock).toHaveBeenCalledWith("rt", 7);

    expect(setTokenOnlyMock).toHaveBeenCalledWith({ accessToken: "at" });
    expect(dispatch).toHaveBeenCalledWith({
      type: "auth/setTokenOnly",
      payload: { accessToken: "at" },
    });

    expect(saveServerFingerprintMock).not.toHaveBeenCalled();
  });

  it("rememberUser=true → sets cookies (30 days)", async () => {
    const { onLoginQueryStarted } = await import("@/services/authApi");

    const dispatch = vi.fn((a: unknown) => a);

    const arg = {
      email: "a@b.com",
      password: "p",
      language: "en",
      rememberUser: true,
    };

    const queryFulfilled = Promise.resolve({
      data: {
        accessToken: "at",
        refreshToken: "rt",
        user: {} as never,
      },
    });

    await onLoginQueryStarted(arg, { dispatch, queryFulfilled });

    expect(setAccessTokenCookieMock).toHaveBeenCalledWith("at", 30);
    expect(setRefreshTokenCookieMock).toHaveBeenCalledWith("rt", 30);
  });

  it("fingerprintHash present → calls saveServerFingerprint", async () => {
    const { onLoginQueryStarted } = await import("@/services/authApi");

    const dispatch = vi.fn((a: unknown) => a);

    const arg = {
      email: "a@b.com",
      password: "p",
      language: "en",
      rememberUser: false,
    };

    const queryFulfilled = Promise.resolve({
      data: {
        accessToken: "at",
        refreshToken: "rt",
        fingerprintHash: "fh",
        user: {} as never,
      },
    });

    await onLoginQueryStarted(arg, { dispatch, queryFulfilled });

    expect(saveServerFingerprintMock).toHaveBeenCalledTimes(1);
    expect(saveServerFingerprintMock).toHaveBeenCalledWith("fh");
  });

  it("refreshToken absent → does not call setRefreshTokenCookie", async () => {
    const { onLoginQueryStarted } = await import("@/services/authApi");

    const dispatch = vi.fn((a: unknown) => a);

    const arg = {
      email: "a@b.com",
      password: "p",
      language: "en",
      rememberUser: false,
    };

    const queryFulfilled = Promise.resolve({
      data: {
        accessToken: "at",
        user: {} as never,
      },
    });

    await onLoginQueryStarted(arg, { dispatch, queryFulfilled });

    expect(setAccessTokenCookieMock).toHaveBeenCalledWith("at", 7);
    expect(setRefreshTokenCookieMock).not.toHaveBeenCalled();
  });

  it("queryFulfilled rejects → does not trigger any side-effects", async () => {
    const { onLoginQueryStarted } = await import("@/services/authApi");

    const dispatch = vi.fn((a: unknown) => a);

    const arg = {
      email: "a@b.com",
      password: "p",
      language: "en",
      rememberUser: true,
    };

    const queryFulfilled = Promise.reject(new Error("fail"));

    await onLoginQueryStarted(arg, { dispatch, queryFulfilled });

    expect(setAccessTokenCookieMock).not.toHaveBeenCalled();
    expect(setRefreshTokenCookieMock).not.toHaveBeenCalled();
    expect(saveServerFingerprintMock).not.toHaveBeenCalled();
    expect(setTokenOnlyMock).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
