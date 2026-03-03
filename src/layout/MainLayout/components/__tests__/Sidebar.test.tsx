import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MenuProps } from "antd";
import type { MenuItem, RouteKey } from "../../types";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "../Sidebar";

type AntdMenuProps = {
  selectedKeys?: string[];
  items?: MenuItem[];
  onClick?: MenuProps["onClick"];
};

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    Menu: ({ selectedKeys, items, onClick }: AntdMenuProps) => (
      <div data-testid="menu" data-selected={String(selectedKeys?.[0] ?? "")}>
        {(items ?? [])
          .filter((i) => typeof (i as MenuItem).key === "string")
          .map((i) => {
            const key = String((i as MenuItem).key);
            const label = (i as MenuItem).label;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (!onClick) return;
                  onClick({ key } as Parameters<NonNullable<MenuProps["onClick"]>>[0]);
                }}
              >
                {label as string}
              </button>
            );
          })}
      </div>
    ),
    Divider: () => <div data-testid="divider" />,
    Avatar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Typography: { Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span> },
  };
});

describe("Sidebar", () => {
  const menuItems: MenuItem[] = [
    { key: "vacancies", label: "Vacancies" },
    { type: "divider" },
    { key: "profile", label: "Profile" },
  ];

  const renderSidebar = (args: { collapsed: boolean; isMobile: boolean; currentKey: RouteKey }) =>
    render(
      <Sidebar
        collapsed={args.collapsed}
        isMobile={args.isMobile}
        sidebarTitle="Decomplex"
        userName="John Doe"
        userCompanyName="Acme"
        userRoleLabel="admin"
        currentKey={args.currentKey}
        menuItems={menuItems}
        isDark={false}
        onMenuClick={() => void 0}
      />,
    );

  it("renders the sidebar title", () => {
    renderSidebar({ collapsed: false, isMobile: false, currentKey: "vacancies" });
    expect(screen.getByLabelText("sidebar-header")).toHaveTextContent("Decomplex");
  });

  it("Shows the user block when not collapsed", () => {
    renderSidebar({ collapsed: false, isMobile: false, currentKey: "vacancies" });
    expect(screen.getByLabelText("sidebar-user")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("Hides the user block when collapsed and not mobile", () => {
    renderSidebar({ collapsed: true, isMobile: false, currentKey: "vacancies" });
    expect(screen.queryByLabelText("sidebar-user")).toBeNull();
  });

  it("On mobile, it shows the user block even when collapsed.", () => {
    renderSidebar({ collapsed: true, isMobile: true, currentKey: "vacancies" });
    expect(screen.getByLabelText("sidebar-user")).toBeInTheDocument();
  });

  it("Throws onMenuClick when a menu item is clicked", async () => {
    const onMenuClick = vi.fn();

    render(
      <Sidebar
        collapsed={false}
        isMobile={false}
        sidebarTitle="Decomplex"
        userName="John Doe"
        userCompanyName="Acme"
        userRoleLabel="admin"
        currentKey="vacancies"
        menuItems={[{ key: "users", label: "Users" }]}
        isDark={false}
        onMenuClick={onMenuClick}
      />,
    );

    const u = userEvent.setup();
    await u.click(screen.getByRole("button", { name: "Users" }));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });
});
