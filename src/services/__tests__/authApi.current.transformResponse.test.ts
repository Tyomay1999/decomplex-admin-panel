import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CurrentSessionDto } from "@/features/auth/types";

type ApiSuccessResponse<T> = { data: T };

type QueryDef<TResult> = {
  transformResponse: (res: ApiSuccessResponse<TResult>) => TResult;
};

type EndpointsMap = {
  current: QueryDef<CurrentSessionDto>;
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

describe("authApi.current.transformResponse", () => {
  beforeEach(() => {
    captured.endpoints = null;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns res.data as-is (passthrough)", async () => {
    await import("@/services/authApi");

    const current = captured.endpoints?.current;
    expect(current).toBeTruthy();

    const session: CurrentSessionDto = {
      userType: "company",
      user: {
        id: "u1",
        email: "a@b.com",
        role: "admin",
        language: "en",
        position: null,
        companyId: "c1",
        userType: "company",
      },
      company: { id: "c1", name: "Acme" },
    };

    const res: ApiSuccessResponse<CurrentSessionDto> = { data: session };

    const out = current!.transformResponse(res);

    expect(out).toEqual(session);
  });
});
