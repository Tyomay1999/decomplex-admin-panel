import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { MenuProps } from "antd";
import type { Lang } from "@/i18n";
import { useTopBarMenu } from "../useTopBarMenu";

type TFn = (key: string, opts?: { defaultValue?: string }) => string;

const t: TFn = (_k, opts) => opts?.defaultValue ?? _k;

const click = (onClick: NonNullable<MenuProps["onClick"]>, key: string) => {
  act(() => {
    onClick({ key } as unknown as Parameters<NonNullable<MenuProps["onClick"]>>[0]);
  });
};

describe("useTopBarMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders disabled email as the first item", () => {
    const { result } = renderHook(() =>
      useTopBarMenu({
        t,
        currentLanguage: "en",
        onChangeLanguage: () => void 0,
        isDark: false,
        onToggleTheme: () => void 0,
        userEmail: "a@b.com",
        onRequestLogout: () => void 0,
      }),
    );

    const first = result.current.items[0] as NonNullable<MenuProps["items"]>[number] & {
      key?: string;
      disabled?: boolean;
      label?: unknown;
    };

    expect(first.key).toBe("user-email");
    expect(first.disabled).toBe(true);
    expect(first.label).toBe("a@b.com");
  });

  it("The logout click calls onRequestLogout", () => {
    const onRequestLogout = vi.fn<[], void>();

    const { result } = renderHook(() =>
      useTopBarMenu({
        t,
        currentLanguage: "en",
        onChangeLanguage: () => void 0,
        isDark: false,
        onToggleTheme: () => void 0,
        userEmail: "a@b.com",
        onRequestLogout,
      }),
    );

    click(result.current.onClick, "logout");

    expect(onRequestLogout).toHaveBeenCalledTimes(1);
  });

  it("theme:light calls onToggleTheme(false)", () => {
    const onToggleTheme = vi.fn<[boolean], void>();

    const { result } = renderHook(() =>
      useTopBarMenu({
        t,
        currentLanguage: "en",
        onChangeLanguage: () => void 0,
        isDark: true,
        onToggleTheme,
        userEmail: "a@b.com",
        onRequestLogout: () => void 0,
      }),
    );

    click(result.current.onClick, "theme:light");

    expect(onToggleTheme).toHaveBeenCalledWith(false);
  });

  it("theme:dark calls onToggleTheme(true)", () => {
    const onToggleTheme = vi.fn<[boolean], void>();

    const { result } = renderHook(() =>
      useTopBarMenu({
        t,
        currentLanguage: "en",
        onChangeLanguage: () => void 0,
        isDark: false,
        onToggleTheme,
        userEmail: "a@b.com",
        onRequestLogout: () => void 0,
      }),
    );

    click(result.current.onClick, "theme:dark");

    expect(onToggleTheme).toHaveBeenCalledWith(true);
  });

  it("lang:ru calls onChangeLanguage('ru')", () => {
    const onChangeLanguage = vi.fn<[Lang], void>();

    const { result } = renderHook(() =>
      useTopBarMenu({
        t,
        currentLanguage: "en",
        onChangeLanguage,
        isDark: false,
        onToggleTheme: () => void 0,
        userEmail: "a@b.com",
        onRequestLogout: () => void 0,
      }),
    );

    click(result.current.onClick, "lang:ru");

    expect(onChangeLanguage).toHaveBeenCalledWith("ru");
  });

  it("ignores unknown keys (does not call handlers)", () => {
    const onChangeLanguage = vi.fn<[Lang], void>();
    const onToggleTheme = vi.fn<[boolean], void>();
    const onRequestLogout = vi.fn<[], void>();

    const { result } = renderHook(() =>
      useTopBarMenu({
        t,
        currentLanguage: "en",
        onChangeLanguage,
        isDark: false,
        onToggleTheme,
        userEmail: "a@b.com",
        onRequestLogout,
      }),
    );

    click(result.current.onClick, "unknown:key");

    expect(onRequestLogout).toHaveBeenCalledTimes(0);
    expect(onToggleTheme).toHaveBeenCalledTimes(0);
    expect(onChangeLanguage).toHaveBeenCalledTimes(0);
  });

  it("In Language Children, the current language is disabled.", () => {
    const { result } = renderHook(() =>
      useTopBarMenu({
        t,
        currentLanguage: "hy",
        onChangeLanguage: () => void 0,
        isDark: false,
        onToggleTheme: () => void 0,
        userEmail: "a@b.com",
        onRequestLogout: () => void 0,
      }),
    );

    const settings = result.current.items.find(
      (x) => (x as { key?: string }).key === "language",
    ) as { children?: Array<{ key?: string; disabled?: boolean }> } | undefined;

    const hy = settings?.children?.find((x) => x.key === "lang:hy");
    expect(hy?.disabled).toBe(true);
  });

  it("The theme 'Children' correctly disables isDark.", () => {
    const { result } = renderHook(() =>
      useTopBarMenu({
        t,
        currentLanguage: "en",
        onChangeLanguage: () => void 0,
        isDark: true,
        onToggleTheme: () => void 0,
        userEmail: "a@b.com",
        onRequestLogout: () => void 0,
      }),
    );

    const theme = result.current.items.find((x) => (x as { key?: string }).key === "theme") as
      | { children?: Array<{ key?: string; disabled?: boolean }> }
      | undefined;

    const light = theme?.children?.find((x) => x.key === "theme:light");
    const dark = theme?.children?.find((x) => x.key === "theme:dark");

    expect(light?.disabled).toBe(false);
    expect(dark?.disabled).toBe(true);
  });
});
