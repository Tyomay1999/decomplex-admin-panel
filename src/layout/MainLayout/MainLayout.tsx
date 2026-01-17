import { FC, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { MenuProps } from "antd";
import { Drawer, Layout, App as AntdApp } from "antd";

import type { RootState } from "@/store";
import type { Role, UserDto } from "@/features/auth/types";
import type { Lang } from "@/i18n";

import { useLogout } from "./hooks/useLogout";
import { useLayoutMode, useMainLayoutTitles, useRouteKey, useSidebarMenu } from "./hooks";
import { Sidebar, ContentRoutes } from "./components";
import type { RouteKey } from "./types";
import { TopBar } from "@/components/layout/TopBar";

const { Header, Sider, Content } = Layout;

type Props = {
  currentLanguage: Lang;
  onChangeLanguage: (lng: Lang) => void;
  isDark: boolean;
  onToggleTheme: (nextIsDark: boolean) => void;
};

const buildSidebarUserLabel = (
  rawName: string | null | undefined,
  email: string | undefined,
  fallback: string,
): string => {
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const safeEmail = typeof email === "string" ? email.trim() : "";

  if (name.length === 0) return safeEmail.length > 0 ? safeEmail : fallback;

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];

  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  const lastInitial = last.length > 0 ? `${last[0]?.toUpperCase() ?? ""}.` : "";
  return `${first} ${lastInitial}`.trim();
};

const normalizeRole = (value: unknown): Role => {
  if (value === "admin" || value === "company_manager" || value === "recruiter" || value === "user")
    return value;
  return "user";
};

const isRouteKey = (value: string): value is RouteKey => {
  return (
    value === "dashboard" ||
    value === "users" ||
    value === "vacancies" ||
    value === "profile" ||
    value === "events"
  );
};

const toTopBarUser = (
  user: UserDto | null,
): { email: string; name?: string | null; avatarUrl?: string | null } => {
  const email = user?.email ?? "";
  const name = user?.name ?? null;
  return { email, name, avatarUrl: null };
};

export const MainLayout: FC<Props> = ({
  currentLanguage,
  onChangeLanguage,
  isDark,
  onToggleTheme,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { modal } = AntdApp.useApp();

  const { isMobile, isTablet } = useLayoutMode();
  const currentKey = useRouteKey();

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const user = useSelector((state: RootState) => state.auth.user);

  const userRole = useMemo<Role>(() => normalizeRole(user?.role), [user?.role]);

  const userCompanyName = user?.company?.name ?? t("common.company", { defaultValue: "Company" });

  const userName = buildSidebarUserLabel(
    user?.name,
    user?.email,
    t("common.user", { defaultValue: "User" }),
  );

  const { sidebarTitle } = useMainLayoutTitles({ collapsed, isMobile });
  const menuItems = useSidebarMenu({ role: userRole });

  const doLogout = useLogout();

  const handleRequestLogout = useCallback((): void => {
    let destroy: (() => void) | null = null;

    const instance = modal.confirm({
      title: t("auth.logoutConfirmTitle", { defaultValue: "Log out?" }),
      content: t("auth.logoutConfirmText", {
        defaultValue: "You will be signed out of the admin panel.",
      }),
      okText: t("common.logout", { defaultValue: "Logout" }),
      cancelText: t("common.cancel", { defaultValue: "Cancel" }),
      okButtonProps: { danger: true },
      onOk: async () => {
        if (destroy) destroy();
        await doLogout();
      },
    });

    destroy = () => instance.destroy();
  }, [modal, t, doLogout]);

  const handleMenuClick: MenuProps["onClick"] = useCallback(
    (info) => {
      const key = String(info.key);

      if (key === "action:logout") {
        handleRequestLogout();
        return;
      }

      if (!isRouteKey(key)) return;

      if (key === "dashboard") navigate("/");
      else navigate(`/${key}`);

      if (isMobile) setDrawerOpen(false);
    },
    [navigate, isMobile, handleRequestLogout],
  );

  const contentMargin = isMobile ? 12 : isTablet ? 16 : 20;
  const contentPadding = isMobile ? 12 : isTablet ? 16 : 20;

  const sidebarNode = (
    <Sidebar
      collapsed={collapsed}
      isMobile={isMobile}
      isDark={isDark}
      sidebarTitle={sidebarTitle}
      userName={userName}
      userCompanyName={userCompanyName}
      userRoleLabel={String(userRole)}
      currentKey={currentKey}
      menuItems={menuItems}
      onMenuClick={handleMenuClick}
    />
  );

  const handleToggleSidebar = (): void => {
    if (isMobile) setDrawerOpen(true);
    else setCollapsed((prev) => !prev);
  };

  const topBarUser = useMemo(() => toTopBarUser(user), [user]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile ? (
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={240}
          style={{
            background: isDark ? "#001529" : "#ffffff",
            borderRight: isDark ? "none" : "1px solid rgba(15,23,42,0.08)",
          }}
        >
          {sidebarNode}
        </Sider>
      ) : (
        <Drawer
          open={drawerOpen}
          placement="left"
          onClose={() => setDrawerOpen(false)}
          styles={{ body: { padding: 0 } }}
          size="default"
        >
          <div style={{ height: "100%", background: isDark ? "#001529" : "#ffffff" }}>
            {sidebarNode}
          </div>
        </Drawer>
      )}

      <Layout>
        <Header style={{ padding: 0, height: "auto", background: "transparent" }}>
          <TopBar
            user={topBarUser}
            brand="Decomplex"
            sidebarToggle={{ collapsed, onToggle: handleToggleSidebar }}
            isDark={isDark}
            onToggleTheme={onToggleTheme}
            currentLanguage={currentLanguage}
            onRequestLogout={handleRequestLogout}
            isMobile={isMobile}
            onChangeLanguage={onChangeLanguage}
          />
        </Header>

        <Content
          className="app-shellContent"
          style={{
            margin: contentMargin,
            padding: contentPadding,
            borderRadius: 12,
            minHeight: 280,
          }}
        >
          <ContentRoutes />
        </Content>
      </Layout>
    </Layout>
  );
};
