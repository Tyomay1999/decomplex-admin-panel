import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MeResponseData, UserDto } from "@/features/auth/types";

type ApiSuccessResponse<T> = { data: T };

type QueryDef<TResult> = {
  transformResponse: (res: ApiSuccessResponse<MeResponseData>) => TResult;
};

type EndpointsMap = {
  me: QueryDef<UserDto>;
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

describe("authApi.me.transformResponse", () => {
  beforeEach(() => {
    captured.endpoints = null;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("user + company → merges company into user", async () => {
    await import("@/services/authApi");

    const me = captured.endpoints?.me;
    expect(me).toBeTruthy();

    const res: ApiSuccessResponse<MeResponseData> = {
      data: {
        user: { id: "u1", email: "a@b.com", role: "admin" },
        company: { id: "c1", name: "Acme" },
      },
    };

    const out = me!.transformResponse(res);

    expect(out).toEqual({
      id: "u1",
      email: "a@b.com",
      role: "admin",
      company: { id: "c1", name: "Acme" },
    });
  });

  it("fallback without user → returns data as-is", async () => {
    await import("@/services/authApi");

    const me = captured.endpoints?.me;
    expect(me).toBeTruthy();

    const res: ApiSuccessResponse<MeResponseData> = {
      data: { id: "u2", email: "x@y.com", role: "recruiter", company: null },
    };

    const out = me!.transformResponse(res);

    expect(out).toEqual({ id: "u2", email: "x@y.com", role: "recruiter", company: null });
  });

  it("user present but company missing → company becomes null", async () => {
    await import("@/services/authApi");

    const me = captured.endpoints?.me;
    expect(me).toBeTruthy();

    const res: ApiSuccessResponse<MeResponseData> = {
      data: {
        user: { id: "u3", email: "no@company.com", role: "admin" },
      },
    };

    const out = me!.transformResponse(res);

    expect(out).toEqual({
      id: "u3",
      email: "no@company.com",
      role: "admin",
      company: null,
    });
  });
});
