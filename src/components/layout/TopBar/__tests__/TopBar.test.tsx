import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MenuProps } from "antd";
import type { TopBarProps } from "../types";
import type { Lang } from "@/i18n";

const useTopBarMenuMock = vi.fn<
  [
    {
      t: (key: string, opts?: { defaultValue?: string }) => string;
      currentLanguage: Lang;
      onChangeLanguage: (lng: Lang) => void;
      isDark: boolean;
      onToggleTheme: (nextIsDark: boolean) => void;
      userEmail: string;
      onRequestLogout: () => void;
    },
  ],
  { items: NonNullable<MenuProps["items"]>; onClick: NonNullable<MenuProps["onClick"]> }
>(() => ({
  items: [{ key: "x", label: "X" }],
  onClick: () => void 0,
}));

const dropdownSpy = vi.fn<
  [
    {
      menu: MenuProps;
      children: React.ReactNode;
    },
  ],
  JSX.Element
>(({ children }) => <div data-testid="dropdown">{children}</div>);

vi.mock("../hooks", () => ({
  useTopBarMenu: (p: Parameters<typeof useTopBarMenuMock>[0]) => useTopBarMenuMock(p),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _k,
  }),
}));

vi.mock("antd", () => ({
  Avatar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Button: ({
    onClick,
    "aria-label": ariaLabel,
  }: {
    onClick?: () => void;
    "aria-label"?: string;
  }) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}>
      toggle
    </button>
  ),
  Dropdown: (p: { menu: MenuProps; children: React.ReactNode }) => dropdownSpy(p),
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: { Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span> },
}));

vi.mock("@ant-design/icons", () => ({
  MenuFoldOutlined: () => <span>fold</span>,
  MenuUnfoldOutlined: () => <span>unfold</span>,
  UserOutlined: () => <span>user</span>,
}));

import { TopBar } from "../TopBar";

const makeProps = (p?: Partial<TopBarProps>): TopBarProps => {
  const onChangeLanguage = vi.fn<[Lang], void>();
  const onToggleTheme = vi.fn<[boolean], void>();
  const onRequestLogout = vi.fn<[], void>();

  return {
    brand: "Decomplex",
    currentLanguage: "en",
    onChangeLanguage,
    isDark: false,
    onToggleTheme,
    user: { email: "a@b.com", name: null, avatarUrl: null },
    isMobile: false,
    onRequestLogout,
    sidebarToggle: { collapsed: false, onToggle: vi.fn<[], void>() },
    ...p,
  };
};

describe("TopBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Renders a toggle button if sidebarToggle is passed, and calls onToggle on click", async () => {
    const onToggle = vi.fn<[], void>();
    render(<TopBar {...makeProps({ sidebarToggle: { collapsed: false, onToggle } })} />);

    const u = userEvent.setup();
    await u.click(screen.getByRole("button", { name: "Toggle menu" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("Does not render the toggle button if sidebarToggle is not passed", () => {
    render(<TopBar {...makeProps({ sidebarToggle: undefined })} />);
    expect(screen.queryByRole("button", { name: "Toggle menu" })).toBeNull();
  });

  it("Shows brand only on mobile", () => {
    render(<TopBar {...makeProps({ isMobile: true })} />);
    expect(screen.getByText("Decomplex")).toBeInTheDocument();
  });

  it("The brand doesn't show on the desktop.", () => {
    render(<TopBar {...makeProps({ isMobile: false })} />);
    expect(screen.queryByText("Decomplex")).toBeNull();
  });

  it("Calls useTopBarMenu with userEmail and handlers", () => {
    const onChangeLanguage = vi.fn<[Lang], void>();
    const onToggleTheme = vi.fn<[boolean], void>();
    const onRequestLogout = vi.fn<[], void>();

    render(
      <TopBar
        {...makeProps({
          currentLanguage: "hy",
          onChangeLanguage,
          isDark: true,
          onToggleTheme,
          user: { email: "x@y.z", name: null, avatarUrl: null },
          onRequestLogout,
        })}
      />,
    );

    const args = useTopBarMenuMock.mock.calls[0]?.[0];
    expect(args).toBeTruthy();
    expect(args!.userEmail).toBe("x@y.z");
    expect(args!.currentLanguage).toBe("hy");
    expect(args!.isDark).toBe(true);
    expect(args!.onChangeLanguage).toBe(onChangeLanguage);
    expect(args!.onToggleTheme).toBe(onToggleTheme);
    expect(args!.onRequestLogout).toBe(onRequestLogout);
  });

  it("passes items/onClick from useTopBarMenu to Dropdown.menu", () => {
    const items: NonNullable<MenuProps["items"]> = [{ key: "k", label: "K" }];
    const onClick: NonNullable<MenuProps["onClick"]> = () => void 0;

    useTopBarMenuMock.mockReturnValueOnce({ items, onClick });

    render(<TopBar {...makeProps()} />);

    const props = dropdownSpy.mock.calls[0]?.[0];
    expect(props).toBeTruthy();
    expect(props!.menu.items).toBe(items);
    expect(props!.menu.onClick).toBe(onClick);
  });
});
