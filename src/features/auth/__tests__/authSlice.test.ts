import { describe, it, expect, vi, beforeEach } from "vitest";
import type { UserDto, CurrentSessionDto } from "@/features/auth/types";

const clearAccessTokenCookieMock = vi.fn();
const clearRefreshTokenCookieMock = vi.fn();

vi.mock("@/services/authHelpers", () => ({
  clearAccessTokenCookie: () => clearAccessTokenCookieMock(),
  clearRefreshTokenCookie: () => clearRefreshTokenCookieMock(),
}));

describe("authSlice", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("setChecking → sets status=checking", async () => {
    const { default: reducer, setChecking } = await import("@/features/auth/authSlice");

    const prev = { accessToken: null, user: null, session: null, status: "idle" as const };
    const next = reducer(prev, setChecking());

    expect(next).toEqual({ ...prev, status: "checking" });
  });

  it("setTokenOnly → sets accessToken and status=checking", async () => {
    const { default: reducer, setTokenOnly } = await import("@/features/auth/authSlice");

    const prev = { accessToken: null, user: null, session: null, status: "idle" as const };
    const next = reducer(prev, setTokenOnly({ accessToken: "at" }));

    expect(next.accessToken).toBe("at");
    expect(next.status).toBe("checking");
    expect(next.user).toBeNull();
    expect(next.session).toBeNull();
  });

  it("setCredentials → sets accessToken/user/session and status=authenticated", async () => {
    const { default: reducer, setCredentials } = await import("@/features/auth/authSlice");

    const prev = { accessToken: null, user: null, session: null, status: "idle" as const };

    const user: UserDto = {
      id: "u1",
      email: "a@b.com",
      role: "admin",
    };

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

    const next = reducer(prev, setCredentials({ accessToken: "at", user, session }));

    expect(next.accessToken).toBe("at");
    expect(next.user).toEqual(user);
    expect(next.session).toEqual(session);
    expect(next.status).toBe("authenticated");
  });

  it("setAnonymous → clears auth data and sets status=anonymous", async () => {
    const { default: reducer, setAnonymous } = await import("@/features/auth/authSlice");

    const prev = {
      accessToken: "at",
      user: {
        id: "u1",
        email: "a@b.com",
        role: "admin",
      } as UserDto,
      session: {
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
      } as CurrentSessionDto,
      status: "authenticated" as const,
    };

    const next = reducer(prev, setAnonymous());

    expect(next.accessToken).toBeNull();
    expect(next.user).toBeNull();
    expect(next.session).toBeNull();
    expect(next.status).toBe("anonymous");
  });

  it("localLogout → clears state, sets status=anonymous, clears cookies", async () => {
    const { default: reducer, localLogout } = await import("@/features/auth/authSlice");

    const prev = {
      accessToken: "at",
      user: {
        id: "u1",
        email: "a@b.com",
        role: "admin",
      } as UserDto,
      session: {
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
      } as CurrentSessionDto,
      status: "authenticated" as const,
    };

    const next = reducer(prev, localLogout());

    expect(next.accessToken).toBeNull();
    expect(next.user).toBeNull();
    expect(next.session).toBeNull();
    expect(next.status).toBe("anonymous");

    expect(clearAccessTokenCookieMock).toHaveBeenCalledTimes(1);
    expect(clearRefreshTokenCookieMock).toHaveBeenCalledTimes(1);
  });

  it("resetAuthState → returns initialState", async () => {
    const { default: reducer, resetAuthState } = await import("@/features/auth/authSlice");

    const prev = {
      accessToken: "at",
      user: {
        id: "u1",
        email: "a@b.com",
        role: "admin",
      } as UserDto,
      session: {
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
      } as CurrentSessionDto,
      status: "authenticated" as const,
    };

    const next = reducer(prev, resetAuthState());

    expect(next).toEqual({
      accessToken: null,
      user: null,
      session: null,
      status: "idle",
    });
  });
});
