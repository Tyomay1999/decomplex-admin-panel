import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import type { CurrentSessionDto, UserDto } from "@/features/auth/types";

type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

type RootStateShape = {
  auth: {
    status: AuthStatus;
    user: UserDto | null;
    session: CurrentSessionDto | null;
    accessToken: string | null;
  };
};

type SetCredentialsPayload = {
  accessToken: string;
  user: UserDto;
  session: CurrentSessionDto | null;
};

type DispatchFn = (a: unknown) => unknown;

let mockState: RootStateShape = {
  auth: { status: "idle", user: null, session: null, accessToken: null },
};

const dispatchMock = vi.fn<DispatchFn>((a) => a);

vi.mock("react-redux", () => ({
  useSelector: (sel: (s: RootStateShape) => unknown) => sel(mockState),
  useDispatch: () => dispatchMock,
}));

const getAccessTokenFromCookieMock = vi.fn<string | null, []>();

vi.mock("@/services/authHelpers", () => ({
  getAccessTokenFromCookie: () => getAccessTokenFromCookieMock(),
}));

const setAnonymousMock = vi.fn(() => ({ type: "auth/setAnonymous" }));
const setCheckingMock = vi.fn(() => ({ type: "auth/setChecking" }));
const setCredentialsMock = vi.fn((p: SetCredentialsPayload) => ({
  type: "auth/setCredentials",
  payload: p,
}));

vi.mock("@/features/auth/authSlice", () => ({
  setAnonymous: () => setAnonymousMock(),
  setChecking: () => setCheckingMock(),
  setCredentials: (p: SetCredentialsPayload) => setCredentialsMock(p),
}));

type TriggerResult<T> = { unwrap: () => Promise<T> };
type Trigger<T> = () => TriggerResult<T>;

let triggerMe: Trigger<UserDto>;
let triggerCurrent: Trigger<CurrentSessionDto>;

vi.mock("@/services", () => ({
  useLazyMeQuery: () => [triggerMe],
  useLazyCurrentQuery: () => [triggerCurrent],
}));

import { AuthBootstrap } from "@/routes/AuthBootstrap";

const makeUser = (id: string): UserDto => ({
  id,
  email: `${id}@b.com`,
  role: "admin",
});

const makeSession = (userId: string): CurrentSessionDto => ({
  userType: "company",
  user: {
    id: userId,
    email: `${userId}@b.com`,
    role: "admin",
    language: "en",
    position: null,
    companyId: "c1",
    userType: "company",
  },
  company: { id: "c1", name: "Acme" },
});

describe("AuthBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockState = { auth: { status: "idle", user: null, session: null, accessToken: null } };
    getAccessTokenFromCookieMock.mockReset();

    triggerMe = () => ({ unwrap: () => Promise.resolve(makeUser("u1")) });
    triggerCurrent = () => ({ unwrap: () => Promise.resolve(makeSession("u1")) });
  });

  it("does nothing when status is not idle/checking", async () => {
    mockState.auth.status = "authenticated";
    getAccessTokenFromCookieMock.mockReturnValue("at");

    render(
      <AuthBootstrap>
        <div data-testid="child" />
      </AuthBootstrap>,
    );

    await waitFor(() => {
      expect(dispatchMock).not.toHaveBeenCalled();
    });
  });

  it("no token → dispatches setAnonymous", async () => {
    mockState.auth.status = "idle";
    getAccessTokenFromCookieMock.mockReturnValue(null);

    render(
      <AuthBootstrap>
        <div data-testid="child" />
      </AuthBootstrap>,
    );

    await waitFor(() => {
      expect(setAnonymousMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({ type: "auth/setAnonymous" });
    });
  });

  it("token present → setChecking then setCredentials with user+session", async () => {
    mockState.auth.status = "idle";
    getAccessTokenFromCookieMock.mockReturnValue("at");

    render(
      <AuthBootstrap>
        <div data-testid="child" />
      </AuthBootstrap>,
    );

    await waitFor(() => {
      expect(setCheckingMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({ type: "auth/setChecking" });
    });

    await waitFor(() => {
      expect(setCredentialsMock).toHaveBeenCalledTimes(1);

      const payload = setCredentialsMock.mock.calls[0]?.[0];
      expect(payload).toBeTruthy();

      const p = payload as SetCredentialsPayload;
      expect(p.accessToken).toBe("at");
      expect(p.user.id).toBe("u1");
      expect(p.session).toBeTruthy();

      expect(dispatchMock).toHaveBeenCalledWith({
        type: "auth/setCredentials",
        payload: p,
      });
    });
  });

  it("me returns user without id → dispatches setAnonymous", async () => {
    mockState.auth.status = "idle";
    getAccessTokenFromCookieMock.mockReturnValue("at");

    triggerMe = () => ({ unwrap: () => Promise.resolve({ ...makeUser("u1"), id: "" }) });

    render(
      <AuthBootstrap>
        <div data-testid="child" />
      </AuthBootstrap>,
    );

    await waitFor(() => {
      expect(setCheckingMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(setAnonymousMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({ type: "auth/setAnonymous" });
    });
  });

  it("me rejects → dispatches setAnonymous", async () => {
    mockState.auth.status = "idle";
    getAccessTokenFromCookieMock.mockReturnValue("at");

    triggerMe = () => ({ unwrap: () => Promise.reject(new Error("fail")) });

    render(
      <AuthBootstrap>
        <div data-testid="child" />
      </AuthBootstrap>,
    );

    await waitFor(() => {
      expect(setCheckingMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(setAnonymousMock).toHaveBeenCalledTimes(1);
      expect(dispatchMock).toHaveBeenCalledWith({ type: "auth/setAnonymous" });
    });
  });

  it("current rejects → still dispatches setCredentials with session=null", async () => {
    mockState.auth.status = "idle";
    getAccessTokenFromCookieMock.mockReturnValue("at");

    triggerCurrent = () => ({ unwrap: () => Promise.reject(new Error("no session")) });

    render(
      <AuthBootstrap>
        <div data-testid="child" />
      </AuthBootstrap>,
    );

    await waitFor(() => {
      expect(setCheckingMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(setCredentialsMock).toHaveBeenCalledTimes(1);

      const payload = setCredentialsMock.mock.calls[0]?.[0] as SetCredentialsPayload;
      expect(payload.accessToken).toBe("at");
      expect(payload.user.id).toBe("u1");
      expect(payload.session).toBeNull();
    });
  });

  it("unmount before async resolves → does not dispatch after unmount", async () => {
    mockState.auth.status = "idle";
    getAccessTokenFromCookieMock.mockReturnValue("at");

    let resolveMe: (v: UserDto) => void = () => undefined;
    const mePromise: Promise<UserDto> = new Promise((res) => {
      resolveMe = res;
    });

    triggerMe = () => ({ unwrap: () => mePromise });

    const view = render(
      <AuthBootstrap>
        <div data-testid="child" />
      </AuthBootstrap>,
    );

    await waitFor(() => {
      expect(setCheckingMock).toHaveBeenCalledTimes(1);
    });

    view.unmount();

    resolveMe(makeUser("u1"));

    await Promise.resolve();

    expect(setCredentialsMock).not.toHaveBeenCalled();
    expect(setAnonymousMock).not.toHaveBeenCalled();
  });
});
