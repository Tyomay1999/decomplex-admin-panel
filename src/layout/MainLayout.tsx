import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import type { MenuProps } from "antd";
import { Layout, Menu, Typography, Avatar, Button, Space, Grid, Drawer, Divider } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  LogoutOutlined,
  ProfileOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import type { RootState } from "@/store";

import { ProfilePage } from "../../pages/ProfilePage";
import { useMeQuery } from "@/services/authApi";
import { useLogoutMutation } from "@/services/authApi";
import { setUser, localLogout } from "@/features/auth/authSlice";
import type { Role } from "@/services/authHelpers";
import type { AppDispatch } from "@/store";
import { UsersPage } from "@/pages/UsersPage";
import { VacanciesPage } from "@/pages/VacanciesPage";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type MenuItem = Required<MenuProps>["items"][number];

function normalizePathToKey(pathname: string): string {
  if (pathname === "/" || pathname === "") return "dashboard";
  return pathname.replace("/", "");
}

export const MainLayout: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: meData, isLoading: isMeLoading, isError: isMeError } = useMeQuery();

  useEffect(() => {
    if (!meData?.user) return;

    const normalizedUser = {
      ...meData.user,
      company: meData.company ? { id: meData.company.id, name: meData.company.name } : null,
    };

    dispatch(setUser(normalizedUser));
  }, [meData, dispatch]);

  useEffect(() => {
    if (isMeError) {
      dispatch(localLogout());
      navigate("/login", { replace: true });
    }
  }, [isMeError, dispatch, navigate]);

  const { t } = useTranslation();

  const user = useSelector((state: RootState) => state.auth.user);

  const userName = user?.name || user?.email || t("common.user", "User");
  const userRole: Role = user?.role ?? "user";
  const userCompanyName = user?.company?.name ?? t("common.company", "Company");

  const canSeeUsers = userRole === "admin" || userRole === "company_manager";
  const canSeeCompanies = userRole === "admin";

  const currentKey = normalizePathToKey(location.pathname || "/");

  const [logoutServer] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutServer().unwrap();
    } finally {
      dispatch(localLogout());
      navigate("/login", { replace: true });
    }
  };

  const handleMenuClick: MenuProps["onClick"] = (info) => {
    const key = info.key;

    if (key === "logout") {
      handleLogout();
      return;
    }

    if (key === "dashboard") {
      navigate("/");
    } else {
      navigate(`/${key}`);
    }

    if (isMobile) setDrawerOpen(false);
  };

  const menuItems: MenuItem[] = [
    { key: "dashboard", icon: <DashboardOutlined />, label: t("nav.dashboard", "Dashboard") },

    { key: "vacancies", icon: <SolutionOutlined />, label: t("nav.vacancies", "Vacancies") },

    ...(canSeeUsers
      ? [{ key: "users", icon: <UserOutlined />, label: t("nav.users", "Users") } as MenuItem]
      : []),

    ...(canSeeCompanies
      ? [
          {
            key: "companies",
            icon: <TeamOutlined />,
            label: t("nav.companies", "Companies"),
          } as MenuItem,
        ]
      : []),

    { key: "events", icon: <CalendarOutlined />, label: t("nav.events", "Events") },

    { type: "divider" } as MenuItem,

    { key: "profile", icon: <ProfileOutlined />, label: t("nav.profile", "Profile") },

    { key: "logout", icon: <LogoutOutlined />, label: t("nav.logout", "Logout") },
  ];

  const SidebarHeader = (
    <div
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        paddingInline: collapsed ? 0 : 16,
        color: "#fff",
        fontWeight: 700,
        fontSize: 16,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {collapsed ? "D" : "Decomplex Admin"}
    </div>
  );

  const UserBlock = (
    <div style={{ padding: 16, display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar icon={<UserOutlined />} />
      <div style={{ minWidth: 0 }}>
        <Text strong style={{ display: "block" }}>
          {userName}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {userCompanyName} • {String(userRole)}
        </Text>
      </div>
    </div>
  );

  const SidebarContent = (
    <div>
      {SidebarHeader}
      <div style={{ background: "rgba(255,255,255,0.04)" }}>
        {collapsed && !isMobile ? null : UserBlock}
      </div>
      <Divider style={{ margin: 0, borderColor: "rgba(255,255,255,0.10)" }} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[currentKey]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </div>
  );

  if (isMeLoading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider collapsible collapsed={collapsed} trigger={null} width={240}>
          {SidebarContent}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          open={drawerOpen}
          placement="left"
          onClose={() => setDrawerOpen(false)}
          bodyStyle={{ padding: 0 }}
          width={280}
        >
          <div style={{ height: "100%", background: "#001529" }}>{SidebarContent}</div>
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            paddingInline: 16,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Button
              type="text"
              onClick={() => {
                if (isMobile) setDrawerOpen(true);
                else setCollapsed((prev) => !prev);
              }}
              icon={
                isMobile ? (
                  <MenuUnfoldOutlined />
                ) : collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
            />

            <Title
              level={4}
              style={{
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {t("app.title", "Decomplex Admin Panel")}
            </Title>
          </div>

          <Space size={12}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span
                style={{
                  maxWidth: 140,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email ?? t("common.user", "User")}
              </span>
            </div>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? 12 : 16,
            padding: isMobile ? 12 : 16,
            background: "#fff",
            borderRadius: 12,
            minHeight: 280,
          }}
        >
          <Routes>
            <Route index element={<ProfilePage />} />

            {/* <Route path="companies" element={<CompaniesPage />} /> */}
            {/* <Route path="events" element={<EventsPage />} /> */}
            <Route path="users" element={<UsersPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="vacancies" element={<VacanciesPage />} />
            <Route path="*" element={<ProfilePage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};
