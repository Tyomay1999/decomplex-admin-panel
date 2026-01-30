import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { LoginFormValues } from "../../types";

type FormApi = { setFieldsValue: (v: Partial<LoginFormValues>) => void };

const setFieldsValue = vi.fn<[Partial<LoginFormValues>], void>();
const formApi: FormApi = { setFieldsValue };

const useForm = vi.fn(() => [formApi] as const);

vi.mock("antd", () => ({
  Form: { useForm: () => useForm() as unknown as readonly [FormApi] },
}));

const changeLanguage = vi.fn<[string], Promise<void>>(() => Promise.resolve());

const useTranslationMock = vi.fn(() => ({
  i18n: { language: "en", changeLanguage },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => useTranslationMock(),
}));

const navigate = vi.fn<[string, { replace: true }], void>();

type LocationState = { from?: { pathname?: unknown } } | null;

let locationState: unknown = null;

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
  useLocation: () => ({ state: locationState }),
}));

type LoginArgs = {
  email: string;
  password: string;
  language: string;
  rememberUser: boolean;
};

type TriggerResult = { unwrap: () => Promise<void> };

const unwrap = vi.fn<[], Promise<void>>(() => Promise.resolve());
const trigger = vi.fn<[LoginArgs], TriggerResult>(() => ({ unwrap }));

const useLoginMutationMock = vi.fn(() => [trigger, { isLoading: false }] as const);

vi.mock("@/services", () => ({
  useLoginMutation: () => useLoginMutationMock(),
}));

import { useLoginForm } from "../useLoginForm";

const submit = async (onFinish: (v: LoginFormValues) => Promise<void>, v: LoginFormValues) => {
  await act(async () => {
    await onFinish(v);
  });
};

describe("useLoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locationState = null;
    useTranslationMock.mockReturnValue({ i18n: { language: "en", changeLanguage } });
    useLoginMutationMock.mockReturnValue([trigger, { isLoading: false }]);
    unwrap.mockResolvedValue();
  });

  it("success: calls login with language and rememberUser=false, then navigate('/')", async () => {
    locationState = null;

    const { result } = renderHook(() => useLoginForm());

    await submit(result.current.onFinish, {
      email: "a@b.com",
      password: "p",
      remember: false,
    });

    expect(trigger).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "p",
      language: "en",
      rememberUser: false,
    });

    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("success: remember=true → rememberUser=true", async () => {
    const { result } = renderHook(() => useLoginForm());

    await submit(result.current.onFinish, {
      email: "a@b.com",
      password: "p",
      remember: true,
    });

    expect(trigger).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "p",
      language: "en",
      rememberUser: true,
    });
  });

  it("success: from pathname without '/' → navigate('/')", async () => {
    locationState = { from: { pathname: "users" } } as LocationState;

    const { result } = renderHook(() => useLoginForm());

    await submit(result.current.onFinish, {
      email: "a@b.com",
      password: "p",
      remember: false,
    });

    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("success: from '/login' → navigate('/')", async () => {
    locationState = { from: { pathname: "/login" } } as LocationState;

    const { result } = renderHook(() => useLoginForm());

    await submit(result.current.onFinish, {
      email: "a@b.com",
      password: "p",
      remember: false,
    });

    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("success: from '/users' → navigate('/users')", async () => {
    locationState = { from: { pathname: "/users" } } as LocationState;

    const { result } = renderHook(() => useLoginForm());

    await submit(result.current.onFinish, {
      email: "a@b.com",
      password: "p",
      remember: false,
    });

    expect(navigate).toHaveBeenCalledWith("/users", { replace: true });
  });

  it("Login error: clears password and doesn't navigate", async () => {
    unwrap.mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => useLoginForm());

    await submit(result.current.onFinish, {
      email: "a@b.com",
      password: "p",
      remember: true,
    });

    expect(setFieldsValue).toHaveBeenCalledWith({ password: "" });
    expect(navigate).toHaveBeenCalledTimes(0);
  });

  it("propagates isLoading from useLoginMutation", () => {
    useLoginMutationMock.mockReturnValueOnce([trigger, { isLoading: true }]);

    const { result } = renderHook(() => useLoginForm());

    expect(result.current.isLoading).toBe(true);
  });

  it("uses the current i18n.language in the payload", async () => {
    useTranslationMock.mockReturnValueOnce({ i18n: { language: "ru", changeLanguage } });

    const { result } = renderHook(() => useLoginForm());

    await submit(result.current.onFinish, {
      email: "a@b.com",
      password: "p",
      remember: false,
    });

    expect(trigger).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "p",
      language: "ru",
      rememberUser: false,
    });
  });
});
