import { describe, it, expect, vi, beforeEach } from "vitest";
type LogoutArg = { refreshToken: string };

type MutationDef<TArg> = {
  query: (arg: TArg) => { url: string; method: string; body?: unknown };
};

type EndpointsMap = {
  logout: MutationDef<LogoutArg>;
};

type Builder = {
  query: <TDef>(def: TDef) => TDef;
  mutation: <TDef>(def: TDef) => TDef;
};

type CreateApiConfig = {
  reducerPath: string;
  baseQuery: unknown;
  endpoints: (builder: Builder) => EndpointsMap;
};

const captured: { endpoints: EndpointsMap | null } = { endpoints: null };

vi.mock("@reduxjs/toolkit/query/react", () => ({
  createApi: (cfg: CreateApiConfig) => {
    const builder: Builder = {
      query: <TDef>(def: TDef) => def,
      mutation: <TDef>(def: TDef) => def,
    };

    captured.endpoints = cfg.endpoints(builder);

    return {
      reducerPath: cfg.reducerPath,
      endpoints: captured.endpoints,
    };
  },
}));

vi.mock("@/services/baseQueryWithReauth", () => ({
  baseQueryWithReauth: vi.fn(),
}));

vi.mock("@/services/authHelpers", () => ({
  getOrCreateFingerprint: vi.fn(() => "fp"),
  saveServerFingerprint: vi.fn(),
  setAccessTokenCookie: vi.fn(),
  setRefreshTokenCookie: vi.fn(),
}));

vi.mock("@/features/auth/authSlice", () => ({
  setTokenOnly: vi.fn((p: { accessToken: string }) => ({ type: "auth/setTokenOnly", payload: p })),
}));

describe("authApi.logout.query", () => {
  beforeEach(() => {
    captured.endpoints = null;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("uses PATCH and sends refreshToken in body", async () => {
    await import("@/services/authApi");

    const logout = captured.endpoints?.logout;
    expect(logout).toBeTruthy();

    const out = logout!.query({ refreshToken: "rt" });

    expect(out).toEqual({
      url: "/auth/logout",
      method: "PATCH",
      body: { refreshToken: "rt" },
    });
  });
});
