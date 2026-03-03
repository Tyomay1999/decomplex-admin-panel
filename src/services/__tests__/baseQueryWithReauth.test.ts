import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

type RawResult = { data?: unknown; error?: FetchBaseQueryError };

type StateShape = { auth: { accessToken: string } };

type MockApi = {
  dispatch: (action: unknown) => unknown;
  getState: () => unknown;
};

type FBQ = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

const ok = (data: unknown): RawResult => ({ data });

const err = (status: FetchBaseQueryError["status"], data?: unknown): RawResult => ({
  error: { status, data } as FetchBaseQueryError,
});

const createApi = (state: StateShape): MockApi => ({
  dispatch: vi.fn((a: unknown) => a),
  getState: vi.fn(() => state),
});

vi.mock("@/i18n", () => ({
  default: { language: "en" },
}));

vi.mock("@/features/auth/authSlice", () => {
  const localLogout = vi.fn(() => ({ type: "auth/localLogout" }));
  const setTokenOnly = vi.fn((p: { accessToken: string }) => ({
    type: "auth/setTokenOnly",
    payload: p,
  }));

  return {
    localLogout,
    setTokenOnly,
  };
});

vi.mock("@/services/authHelpers", () => ({
  getAccessTokenFromCookie: vi.fn(() => null),
  getRefreshTokenFromCookie: vi.fn(() => null),
  getOrCreateFingerprint: vi.fn(() => "fp"),
  saveServerFingerprint: vi.fn(),
  setAccessTokenCookie: vi.fn(),
  setRefreshTokenCookie: vi.fn(),
  clearAccessTokenCookie: vi.fn(),
  clearRefreshTokenCookie: vi.fn(),
}));

vi.mock("@reduxjs/toolkit/query/react", () => ({
  fetchBaseQuery: vi.fn(() => vi.fn(async () => ({ data: {} }))),
}));

const loadSubject = async (): Promise<{
  baseQueryWithReauth: FBQ;
}> => {
  vi.resetModules();
  return import("@/services/baseQueryWithReauth");
};

const loadMocks = async (): Promise<{
  fetchBaseQuery: ReturnType<typeof import("@reduxjs/toolkit/query/react")>["fetchBaseQuery"];
  authHelpers: typeof import("@/services/authHelpers");
  authSlice: typeof import("@/features/auth/authSlice");
}> => {
  const [{ fetchBaseQuery }, authHelpers, authSlice] = await Promise.all([
    import("@reduxjs/toolkit/query/react"),
    import("@/services/authHelpers"),
    import("@/features/auth/authSlice"),
  ]);

  return { fetchBaseQuery, authHelpers, authSlice };
};

describe("baseQueryWithReauth", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await loadSubject();
  });

  it("returns non-401 results as-is", async () => {
    const { fetchBaseQuery, authHelpers, authSlice } = await loadMocks();

    const raw = vi.fn<FBQ>(async () => ok({ value: 1 }));
    vi.mocked(fetchBaseQuery).mockReturnValue(raw);

    const { baseQueryWithReauth } = await loadSubject();
    const api = createApi({ auth: { accessToken: "" } });

    const res = await baseQueryWithReauth("/x", api, {});

    expect(raw).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ data: { value: 1 } });

    expect(vi.mocked(authSlice.localLogout)).not.toHaveBeenCalled();
    expect(vi.mocked(authSlice.setTokenOnly)).not.toHaveBeenCalled();

    expect(vi.mocked(authHelpers.clearAccessTokenCookie)).not.toHaveBeenCalled();
    expect(vi.mocked(authHelpers.clearRefreshTokenCookie)).not.toHaveBeenCalled();
  });

  it("dispatches localLogout when 401 and no refresh token", async () => {
    const { fetchBaseQuery, authHelpers, authSlice } = await loadMocks();

    vi.mocked(authHelpers.getRefreshTokenFromCookie).mockReturnValue(null);

    const raw = vi.fn<FBQ>(async () => err(401));
    vi.mocked(fetchBaseQuery).mockReturnValue(raw);

    const { baseQueryWithReauth } = await loadSubject();
    const api = createApi({ auth: { accessToken: "" } });

    const res = await baseQueryWithReauth("/x", api, {});

    expect(raw).toHaveBeenCalledTimes(1);
    expect(vi.mocked(authSlice.localLogout)).toHaveBeenCalledTimes(1);

    const dispatchMock = api.dispatch as unknown as vi.Mock;
    expect(dispatchMock).toHaveBeenCalledTimes(1);

    expect(res).toEqual({ error: { status: 401, data: undefined } });
  });

  it("refreshes token then retries original request", async () => {
    const { fetchBaseQuery, authHelpers, authSlice } = await loadMocks();

    vi.mocked(authHelpers.getRefreshTokenFromCookie).mockReturnValue("rt");

    const raw = vi.fn<FBQ>(async (args) => {
      const calls = raw.mock.calls.length;

      if (calls === 1) return err(401);

      if (calls === 2) {
        const a = args as FetchArgs;
        if (typeof a === "object" && a.url === "/auth/refresh") {
          return ok({
            success: true,
            data: {
              accessToken: "at",
              refreshToken: "rt2",
              user: {},
              fingerprintHash: "fh",
            },
          });
        }
        return err(500);
      }

      return ok({ done: true });
    });

    vi.mocked(fetchBaseQuery).mockReturnValue(raw);

    const { baseQueryWithReauth } = await loadSubject();
    const api = createApi({ auth: { accessToken: "" } });

    const res = await baseQueryWithReauth("/x", api, {});

    expect(raw).toHaveBeenCalledTimes(3);

    expect(vi.mocked(authHelpers.setAccessTokenCookie)).toHaveBeenCalledWith("at", 7);
    expect(vi.mocked(authHelpers.setRefreshTokenCookie)).toHaveBeenCalledWith("rt2", 30);
    expect(vi.mocked(authHelpers.saveServerFingerprint)).toHaveBeenCalledWith("fh");
    expect(vi.mocked(authSlice.setTokenOnly)).toHaveBeenCalledWith({ accessToken: "at" });

    expect(vi.mocked(authSlice.localLogout)).not.toHaveBeenCalled();
    expect(res).toEqual({ data: { done: true } });
  });

  it("clears cookies and localLogout on refresh failure", async () => {
    const { fetchBaseQuery, authHelpers, authSlice } = await loadMocks();

    vi.mocked(authHelpers.getRefreshTokenFromCookie).mockReturnValue("rt");

    const raw = vi.fn<FBQ>(async (args) => {
      const calls = raw.mock.calls.length;

      if (calls === 1) return err(401);

      if (calls === 2) {
        const a = args as FetchArgs;
        if (typeof a === "object" && a.url === "/auth/refresh") {
          return ok({ success: true, data: { user: {} } });
        }
        return err(500);
      }

      return err(401);
    });

    vi.mocked(fetchBaseQuery).mockReturnValue(raw);

    const { baseQueryWithReauth } = await loadSubject();
    const api = createApi({ auth: { accessToken: "" } });

    const res = await baseQueryWithReauth("/x", api, {});

    expect(vi.mocked(authHelpers.clearAccessTokenCookie)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(authHelpers.clearRefreshTokenCookie)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(authSlice.localLogout)).toHaveBeenCalledTimes(1);

    expect(res).toEqual({ error: { status: 401, data: undefined } });
  });

  it("shares single refresh for concurrent 401 requests", async () => {
    const { fetchBaseQuery, authHelpers } = await loadMocks();

    vi.mocked(authHelpers.getRefreshTokenFromCookie).mockReturnValue("rt");

    let refreshCalls = 0;

    const raw = vi.fn<FBQ>(async (args) => {
      if (typeof args === "object" && args && "url" in args) {
        const a = args as FetchArgs;
        if (a.url === "/auth/refresh") {
          refreshCalls += 1;
          return ok({ success: true, data: { accessToken: "at", user: {} } });
        }
      }

      const callIndex = raw.mock.calls.length;
      if (callIndex <= 2) return err(401);
      return ok({ ok: true });
    });

    vi.mocked(fetchBaseQuery).mockReturnValue(raw);

    const { baseQueryWithReauth } = await loadSubject();
    const api = createApi({ auth: { accessToken: "" } });

    const [r1, r2] = await Promise.all([
      baseQueryWithReauth("/a", api, {}),
      baseQueryWithReauth("/b", api, {}),
    ]);

    expect(refreshCalls).toBe(1);
    expect(r1).toEqual({ data: { ok: true } });
    expect(r2).toEqual({ data: { ok: true } });
  });
});
