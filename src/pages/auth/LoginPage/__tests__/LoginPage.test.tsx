import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Lang } from "@/i18n";

const h = vi.hoisted(() => {
  const changeLanguage = vi.fn<[Lang], Promise<void>>(() => Promise.resolve());

  const useTranslationMock = vi.fn(() => ({
    t: (_k: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _k,
    i18n: { language: "en", changeLanguage },
  }));

  const useLoginFormMock = vi.fn(() => ({
    form: { id: "form" } as { id: string },
    isLoading: false,
    onFinish: vi.fn(),
  }));

  const loginHeaderSpy = vi.fn<[{ title: string; description: string }], JSX.Element>(
    ({ title, description }) => (
      <div>
        <div data-testid="login-title">{title}</div>
        <div data-testid="login-desc">{description}</div>
      </div>
    ),
  );

  const loginFormSpy = vi.fn<
    [
      {
        form: { id: string };
        isLoading: boolean;
        onFinish: (v: unknown) => Promise<void>;
        t: (k: string, o?: { defaultValue?: string }) => string;
      },
    ],
    JSX.Element
  >(({ isLoading }) => <div data-testid="login-form" data-loading={String(isLoading)} />);

  return { changeLanguage, useTranslationMock, useLoginFormMock, loginHeaderSpy, loginFormSpy };
});

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => void 0 },
  useTranslation: () => h.useTranslationMock(),
}));

vi.mock("../hooks", () => ({
  useLoginForm: () => h.useLoginFormMock(),
}));

vi.mock("../components", () => ({
  LoginHeader: (p: { title: string; description: string }) => h.loginHeaderSpy(p),
  LoginForm: (p: {
    form: { id: string };
    isLoading: boolean;
    onFinish: (v: unknown) => Promise<void>;
    t: (k: string, o?: { defaultValue?: string }) => string;
  }) => h.loginFormSpy(p),
}));

vi.mock("@ant-design/icons", () => ({
  MoonOutlined: () => <span>moon</span>,
  SunOutlined: () => <span>sun</span>,
}));

vi.mock("antd", () => {
  const Select = (p: {
    value: Lang;
    options: Array<{ value: Lang; label: string }>;
    onChange: (v: Lang) => void;
  }) => (
    <div>
      <div data-testid="select-value">{p.value}</div>
      {p.options.map((o) => (
        <button key={o.value} type="button" onClick={() => p.onChange(o.value)}>
          lang:{o.value}:{o.label}
        </button>
      ))}
    </div>
  );

  const Button = (p: { onClick?: () => void; "aria-label"?: string }) => (
    <button type="button" aria-label={p["aria-label"]} onClick={p.onClick}>
      btn
    </button>
  );

  return {
    Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Typography: { Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span> },
    Select,
    Button,
  };
});

import { LoginPage } from "../LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    h.useTranslationMock.mockReturnValue({
      t: (_k: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _k,
      i18n: { language: "en", changeLanguage: h.changeLanguage },
    });

    h.useLoginFormMock.mockReturnValue({
      form: { id: "form" },
      isLoading: false,
      onFinish: vi.fn(),
    });
  });

  it("Clicking on a language calls i18n.changeLanguage", async () => {
    render(<LoginPage isDark={false} onToggleTheme={() => void 0} />);

    await userEvent.setup().click(screen.getByRole("button", { name: "lang:ru:RU" }));

    expect(h.changeLanguage).toHaveBeenCalledWith("ru");
  });

  it("determines currentLang via SupportedLang (ru-RU → ru)", () => {
    h.useTranslationMock.mockReturnValueOnce({
      t: (_k: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _k,
      i18n: { language: "ru-RU", changeLanguage: h.changeLanguage },
    });

    render(<LoginPage isDark={false} onToggleTheme={() => void 0} />);

    expect(screen.getByTestId("select-value")).toHaveTextContent("ru");
  });

  it("The theme button calls onToggleTheme(!isDark)", async () => {
    const onToggleTheme = vi.fn<[boolean], void>();

    render(<LoginPage isDark={true} onToggleTheme={onToggleTheme} />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Theme" }));

    expect(onToggleTheme).toHaveBeenCalledWith(false);
  });

  it("passes values from useLoginForm to LoginForm", () => {
    const onFinish = vi.fn();
    h.useLoginFormMock.mockReturnValueOnce({
      form: { id: "form" },
      isLoading: true,
      onFinish,
    });

    render(<LoginPage isDark={false} onToggleTheme={() => void 0} />);

    expect(screen.getByTestId("login-form")).toHaveAttribute("data-loading", "true");

    const args = h.loginFormSpy.mock.calls[0]?.[0];
    expect(args).toBeTruthy();
    expect(args!.form).toEqual({ id: "form" });
    expect(args!.isLoading).toBe(true);
    expect(args!.onFinish).toBe(onFinish);
  });

  it("renders LoginHeader", () => {
    render(<LoginPage isDark={false} onToggleTheme={() => void 0} />);

    expect(screen.getByTestId("login-title")).toBeInTheDocument();
    expect(screen.getByTestId("login-desc")).toBeInTheDocument();
    expect(h.loginHeaderSpy).toHaveBeenCalledTimes(1);
  });
});
