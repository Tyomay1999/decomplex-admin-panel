import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  RegisterCompanyUserPayload,
  RegisterCompanyUserResponseData,
} from "@/services/authApi";

type ApiSuccessResponse<T> = { data: T };

type QueryDef<TArg> = {
  query: (arg: TArg) => { url: string; method: string; body?: unknown };
};

type MutationDef<TArg, TResult> = QueryDef<TArg> & {
  transformResponse?: (res: ApiSuccessResponse<TResult>) => TResult;
};

type EndpointsMap = {
  registerCompanyUser: MutationDef<RegisterCompanyUserPayload, RegisterCompanyUserResponseData>;
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

describe("authApi.registerCompanyUser", () => {
  beforeEach(() => {
    captured.endpoints = null;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("query(body) → POST /auth/register/company-user with body passthrough", async () => {
    await import("@/services/authApi");

    const reg = captured.endpoints?.registerCompanyUser;
    expect(reg).toBeTruthy();

    const body: RegisterCompanyUserPayload = {
      email: "a@b.com",
      password: "p",
      role: "admin",
      position: "CTO",
      language: "en",
    };

    const out = reg!.query(body);

    expect(out).toEqual({
      url: "/auth/register/company-user",
      method: "POST",
      body,
    });
  });

  it("transformResponse → returns res.data", async () => {
    await import("@/services/authApi");

    const reg = captured.endpoints?.registerCompanyUser;
    expect(reg).toBeTruthy();
    expect(reg!.transformResponse).toBeTypeOf("function");

    const res: ApiSuccessResponse<RegisterCompanyUserResponseData> = {
      data: {
        id: "u1",
        email: "a@b.com",
        role: "admin",
        position: null,
        language: "en",
        companyId: "c1",
      },
    };

    const out = reg!.transformResponse!(res);

    expect(out).toEqual(res.data);
  });
});
