import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useBreakpoint = vi.fn();

type FormApi = {
  resetFields: () => void;
  setFieldsValue: (v: unknown) => void;
};

const resetFields = vi.fn();
const setFieldsValue = vi.fn();
const formApi: FormApi = { resetFields, setFieldsValue };

let capturedOnFinish: ((v: unknown) => Promise<void>) | null = null;

vi.mock("antd", () => ({
  Grid: { useBreakpoint: () => useBreakpoint() },
  Typography: { Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span> },
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: (p: { children: React.ReactNode; onClick?: () => void; loading?: boolean }) => (
    <button type="button" onClick={p.onClick} data-loading={String(Boolean(p.loading))}>
      {p.children}
    </button>
  ),
  Input: Object.assign((p: { placeholder?: string }) => <input placeholder={p.placeholder} />, {
    Password: (p: { placeholder?: string }) => <input placeholder={p.placeholder} />,
  }),
  Select: () => <div data-testid="select" />,
  Form: Object.assign(
    (p: { children: React.ReactNode; onFinish?: (v: unknown) => Promise<void> }) => {
      capturedOnFinish = p.onFinish ?? null;
      return <div>{p.children}</div>;
    },
    {
      useForm: () => [formApi] as const,
      Item: (p: { children: React.ReactNode; label?: string }) => (
        <label>
          {p.label}
          {p.children}
        </label>
      ),
    },
  ),
}));

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => void 0 },
  useTranslation: () => ({
    t: (_k: string, o?: { defaultValue?: string }) => o?.defaultValue ?? _k,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

import { CreateUserCard } from "../CreateUserCard";

describe("CreateUserCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnFinish = null;
    useBreakpoint.mockReturnValue({ md: true });
  });

  it("renders the create button", () => {
    render(
      <CreateUserCard isLoading={false} onSubmit={async () => ({ ok: true, message: "ok" })} />,
    );

    expect(screen.getByRole("button", { name: "Create user" })).toBeInTheDocument();
  });

  it("If onSubmit returns ok:true, it resets the form and sets initialValues", async () => {
    const onSubmit = vi.fn(async () => ({ ok: true, message: "ok" }));

    render(<CreateUserCard isLoading={false} onSubmit={onSubmit} />);

    expect(capturedOnFinish).toBeTypeOf("function");

    await capturedOnFinish!({
      email: "a@b.com",
      password: "123",
      role: "recruiter",
      position: "",
      language: "en",
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(resetFields).toHaveBeenCalledTimes(1);
    expect(setFieldsValue).toHaveBeenCalledTimes(1);
  });

  it("If onSubmit returns ok:false, the form is not reset.", async () => {
    const onSubmit = vi.fn(async () => ({ ok: false, message: "nope" }));

    render(<CreateUserCard isLoading={false} onSubmit={onSubmit} />);

    await capturedOnFinish!({
      email: "a@b.com",
      password: "123",
      role: "recruiter",
      position: "",
      language: "en",
    });

    expect(resetFields).toHaveBeenCalledTimes(0);
    expect(setFieldsValue).toHaveBeenCalledTimes(0);
  });

  it("forwards loading to the button", async () => {
    render(
      <CreateUserCard isLoading={true} onSubmit={async () => ({ ok: true, message: "ok" })} />,
    );

    const btn = screen.getByRole("button", { name: "Create user" });
    expect(btn).toHaveAttribute("data-loading", "true");
  });

  it("On mobile, it sets the button to block=true (indirectly via isMobile)", async () => {
    useBreakpoint.mockReturnValue({ md: false });

    render(
      <CreateUserCard isLoading={false} onSubmit={async () => ({ ok: true, message: "ok" })} />,
    );

    expect(screen.getByRole("button", { name: "Create user" })).toBeInTheDocument();
  });
});
