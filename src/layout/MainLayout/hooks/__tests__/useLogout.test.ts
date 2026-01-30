import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLogout } from "../useLogout";

type NavigateFn = (to: string, options: { replace: true }) => void;

const navigate = vi.fn<Parameters<NavigateFn>, ReturnType<NavigateFn>>();
const dispatch = vi.fn<[unknown], void>();

type LogoutArgs = { refreshToken: string };
type Unwrap = () => Promise<void>;
type Trigger = (args: LogoutArgs) => { unwrap: Unwrap };

const unwrap = vi.fn<[], Promise<void>>();
const logoutTrigger = vi.fn<[LogoutArgs], { unwrap: Unwrap }>(() => ({ unwrap }));

const getRefreshTokenFromCookie = vi.fn<[], string | null>();
const localLogout = vi.fn<[], { type: string }>(() => ({ type: "auth/localLogout" }));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigate };
});

vi.mock("react-redux", () => ({
  useDispatch: () => dispatch,
}));

vi.mock("@/services/authApi", () => ({
  useLogoutMutation: (): [Trigger] => [logoutTrigger as unknown as Trigger],
}));

vi.mock("@/features/auth/authSlice", () => ({
  localLogout: () => localLogout(),
}));

vi.mock("@/services/authHelpers", () => ({
  getRefreshTokenFromCookie: () => getRefreshTokenFromCookie(),
}));

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("without refreshToken: dispatch localLogout and navigate to/login", async () => {
    getRefreshTokenFromCookie.mockReturnValue(null);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(logoutTrigger).toHaveBeenCalledTimes(0);
    expect(localLogout).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: "auth/localLogout" });
    expect(navigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("with a refresh token and a successful server logout: calls logoutServer", async () => {
    getRefreshTokenFromCookie.mockReturnValue("rt");
    unwrap.mockResolvedValueOnce();

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(logoutTrigger).toHaveBeenCalledWith({ refreshToken: "rt" });
    expect(unwrap).toHaveBeenCalledTimes(1);
    expect(localLogout).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: "auth/localLogout" });
    expect(navigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("With a refreshToken and a logout error: it still dispatches localLogout", async () => {
    getRefreshTokenFromCookie.mockReturnValue("rt");
    unwrap.mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current();
    });

    expect(logoutTrigger).toHaveBeenCalledWith({ refreshToken: "rt" });
    expect(unwrap).toHaveBeenCalledTimes(1);
    expect(localLogout).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: "auth/localLogout" });
    expect(navigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
