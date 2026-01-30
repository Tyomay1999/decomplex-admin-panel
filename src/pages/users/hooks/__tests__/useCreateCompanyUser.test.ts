import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const success = vi.fn();
const useApp = vi.fn(() => ({ message: { success } }));

vi.mock("antd", () => ({
  App: { useApp: () => useApp() },
}));

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => void 0 },
  useTranslation: () => ({
    t: (_k: string, o?: { defaultValue?: string }) => o?.defaultValue ?? _k,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

type RegisterPayload = {
  email: string;
  password: string;
  role: string;
  position?: string;
  language: string;
};

type RegisteredUser = { id: string; email: string; role: string; companyId: string };

const unwrap = vi.fn<Promise<RegisteredUser>, []>();
const registerUser = vi.fn(() => ({ unwrap }));

const useRegisterCompanyUserMutation = vi.fn(() => [registerUser, { isLoading: false }] as const);

vi.mock("@/services/authApi", () => ({
  useRegisterCompanyUserMutation: () => useRegisterCompanyUserMutation(),
}));

import { useCreateCompanyUser } from "../useCreateCompanyUser";

describe("useCreateCompanyUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRegisterCompanyUserMutation.mockReturnValue([registerUser, { isLoading: false }]);
  });

  it("returns isLoading from the mutation", () => {
    useRegisterCompanyUserMutation.mockReturnValue([registerUser, { isLoading: true }]);

    const { result } = renderHook(() => useCreateCompanyUser());
    expect(result.current.isLoading).toBe(true);
  });

  it("submit: trims email and position to undefined if empty", async () => {
    unwrap.mockResolvedValue({ id: "u1", email: "a@b.com", role: "recruiter", companyId: "c1" });

    const { result } = renderHook(() => useCreateCompanyUser());

    await act(async () => {
      await result.current.submit({
        email: "  a@b.com  ",
        password: "123",
        role: "recruiter",
        position: "   ",
        language: "en",
      });
    });

    const payload = registerUser.mock.calls[0]?.[0] as RegisterPayload;
    expect(payload.email).toBe("a@b.com");
    expect(payload.position).toBeUndefined();
  });

  it("submit: if successful, shows success and returns ok:true + message", async () => {
    unwrap.mockResolvedValue({ id: "u1", email: "a@b.com", role: "admin", companyId: "c1" });

    const { result } = renderHook(() => useCreateCompanyUser());

    await act(async () => {
      return await result.current.submit({
        email: "a@b.com",
        password: "123",
        role: "admin",
        position: "Owner",
        language: "en",
      });
    });

    expect(success).toHaveBeenCalledTimes(1);

    const res2 = await result.current.submit({
      email: "a@b.com",
      password: "123",
      role: "admin",
      position: "Owner",
      language: "en",
    });

    expect(res2.ok).toBe(true);
    expect(res2.data).toEqual({ id: "u1", email: "a@b.com", role: "admin", companyId: "c1" });
    expect(res2.message).toContain("id=u1");
    expect(res2.message).toContain("email=a@b.com");
    expect(res2.message).toContain("role=admin");
    expect(res2.message).toContain("companyId=c1");
  });

  it("submit: on error, returns ok:false and the error text", async () => {
    unwrap.mockRejectedValue({ code: "X", message: "boom" });

    const { result } = renderHook(() => useCreateCompanyUser());

    const res = await result.current.submit({
      email: "a@b.com",
      password: "123",
      role: "admin",
      position: "",
      language: "en",
    });

    expect(res.ok).toBe(false);
    expect(res.message).toContain("Error:");
    expect(res.message).toContain("boom");
  });
});
