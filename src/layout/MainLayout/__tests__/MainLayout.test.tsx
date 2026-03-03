import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { RootState } from "@/store";
import type { Lang } from "@/i18n";
import type { UserDto } from "@/features/auth/types";

const navigate = vi.fn<[string, unknown?], void>();
const confirm = vi.fn<[{ onOk: () => Promise<void> }], { destroy: () => void }>(() => ({
  destroy: () => void 0,
}));

const doLogout = vi.fn<[], Promise<void>>(() => Promise.resolve());

const useSelectorMock = vi.fn<[(selector: (state: RootState) => unknown) => unknown], unknown>();
const useLayoutModeMock = vi.fn<[], { isMobile: boolean; isTablet: boolean }>(() => ({
  isMobile: false,
  isTablet: false,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigate };
});

vi.mock("react-redux", () => ({
  useSelector: (selector: (state: RootState) => unknown) => useSelectorMock(selector),
}));

vi.mock("react-i18next", () => ({
  initReactI18next: {},
  useTranslation: () => ({
    t: (_k: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _k,
    i18n: { resolvedLanguage: "en" },
  }),
}));

vi.mock("antd", () => {
  const LayoutBase = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Sider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Layout = Object.assign(LayoutBase, { Header, Sider, Content });

  const Drawer = ({ open, children }: { open: boolean; children: React.ReactNode }) => (
    <div data-testid="drawer" data-open={String(open)}>
      {open ? children : null}
    </div>
  );

  const App = { useApp: () => ({ modal: { confirm } }) };

  return { Layout, Drawer, App };
});

vi.mock("@/components/layout/TopBar", () => ({
  TopBar: (props: { sidebarToggle: { onToggle: () => void }; onRequestLogout: () => void }) => (
    <div>
      <button type="button" onClick={props.sidebarToggle.onToggle}>
        toggle
      </button>
      <button type="button" onClick={props.onRequestLogout}>
        request-logout
      </button>
    </div>
  ),
}));

vi.mock("../components", () => ({
  Sidebar: (props: { onMenuClick: (info: { key: string }) => void }) => (
    <div>
      <button type="button" onClick={() => props.onMenuClick({ key: "dashboard" })}>
        click-dashboard
      </button>
      <button type="button" onClick={() => props.onMenuClick({ key: "vacancies" })}>
        click-vacancies
      </button>
      <button type="button" onClick={() => props.onMenuClick({ key: "users" })}>
        click-users
      </button>
      <button type="button" onClick={() => props.onMenuClick({ key: "profile" })}>
        click-profile
      </button>
      <button type="button" onClick={() => props.onMenuClick({ key: "action:logout" })}>
        click-logout
      </button>
      <button type="button" onClick={() => props.onMenuClick({ key: "unknown" })}>
        click-unknown
      </button>
    </div>
  ),
  ContentRoutes: () => <div>ContentRoutes</div>,
}));

vi.mock("../hooks/useLogout", () => ({ useLogout: () => doLogout }));

vi.mock("../hooks", () => ({
  useLayoutMode: () => useLayoutModeMock(),
  useRouteKey: () => "vacancies",
  useMainLayoutTitles: () => ({
    sidebarTitle: "Decomplex Admin",
    headerTitle: "Decomplex Admin Panel",
  }),
  useSidebarMenu: () => [
    { key: "vacancies", label: "Vacancies" },
    { key: "users", label: "Users" },
    { type: "divider" },
    { key: "profile", label: "Profile" },
    { key: "action:logout", label: "Logout" },
  ],
}));

import { MainLayout } from "../MainLayout";

const renderLayout = (args: { isMobile: boolean }) => {
  useLayoutModeMock.mockReturnValue({ isMobile: args.isMobile, isTablet: false });

  const state = { auth: { user: { role: "admin" } as UserDto } } as unknown as RootState;
  useSelectorMock.mockImplementation((selector) => selector(state));

  const currentLanguage: Lang = "en";

  return render(
    <MemoryRouter initialEntries={["/vacancies"]}>
      <MainLayout
        currentLanguage={currentLanguage}
        onChangeLanguage={() => void 0}
        isDark={false}
        onToggleTheme={() => void 0}
      />
    </MemoryRouter>,
  );
};

describe("MainLayout smoke", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menu: dashboard navigates to /", async () => {
    renderLayout({ isMobile: false });
    await userEvent.setup().click(screen.getByRole("button", { name: "click-dashboard" }));
    expect(navigate).toHaveBeenCalledWith("/");
  });

  it("logout: onOk calls doLogout", async () => {
    renderLayout({ isMobile: false });
    await userEvent.setup().click(screen.getByRole("button", { name: "click-logout" }));
    const args = confirm.mock.calls[0]?.[0];
    await args!.onOk();
    expect(doLogout).toHaveBeenCalledTimes(1);
  });

  it("On mobile: toggle opens Drawer", async () => {
    renderLayout({ isMobile: true });
    expect(screen.getByTestId("drawer")).toHaveAttribute("data-open", "false");
    await userEvent.setup().click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("drawer")).toHaveAttribute("data-open", "true");
  });

  it("menu: unknown key does not navigate", async () => {
    renderLayout({ isMobile: false });
    await userEvent.setup().click(screen.getByRole("button", { name: "click-unknown" }));
    expect(navigate).toHaveBeenCalledTimes(0);
  });

  it("menu: vacancies navigates to /vacancies", async () => {
    renderLayout({ isMobile: false });
    await userEvent.setup().click(screen.getByRole("button", { name: "click-vacancies" }));
    expect(navigate).toHaveBeenCalledWith("/vacancies");
  });

  it("menu: users navigates to /users", async () => {
    renderLayout({ isMobile: false });
    await userEvent.setup().click(screen.getByRole("button", { name: "click-users" }));
    expect(navigate).toHaveBeenCalledWith("/users");
  });

  it("menu: profile navigates to /profile", async () => {
    renderLayout({ isMobile: false });
    await userEvent.setup().click(screen.getByRole("button", { name: "click-profile" }));
    expect(navigate).toHaveBeenCalledWith("/profile");
  });

  it("On mobile: clicking on a menu item closes the Drawer", async () => {
    renderLayout({ isMobile: true });

    const u = userEvent.setup();

    expect(screen.getByTestId("drawer")).toHaveAttribute("data-open", "false");

    await u.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("drawer")).toHaveAttribute("data-open", "true");

    await u.click(screen.getByRole("button", { name: "click-users" }));
    expect(screen.getByTestId("drawer")).toHaveAttribute("data-open", "false");
  });

  it("logout: calls confirm", async () => {
    renderLayout({ isMobile: false });

    await userEvent.setup().click(screen.getByRole("button", { name: "click-logout" }));

    expect(confirm).toHaveBeenCalledTimes(1);

    const args = confirm.mock.calls[0]?.[0];
    expect(args).toBeTruthy();
    expect(typeof args!.onOk).toBe("function");
  });

  it("logout: confirm onOk calls doLogout", async () => {
    renderLayout({ isMobile: false });

    await userEvent.setup().click(screen.getByRole("button", { name: "click-logout" }));

    const args = confirm.mock.calls[0]?.[0];
    await args!.onOk();

    expect(doLogout).toHaveBeenCalledTimes(1);
  });
});
