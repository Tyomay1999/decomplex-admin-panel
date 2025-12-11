import React from "react";
import { Layout, Menu, Typography, Avatar, Button, Space } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate, Routes, useLocation } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { useDispatch } from "react-redux";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

type MenuItem = Required<MenuProps>["items"][number];

const getMenuItems = (): MenuItem[] => [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "users",
    icon: <UserOutlined />,
    label: "Users",
  },
  {
    key: "companies",
    icon: <TeamOutlined />,
    label: "Companies",
  },
  {
    key: "events",
    icon: <CalendarOutlined />,
    label: "Events",
  },
];

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleMenuClick: MenuProps["onClick"] = (info) => {
    if (info.key === "dashboard") {
      navigate("/");
      return;
    }

    navigate(`/${info.key}`);
  };

  const currentPath = location.pathname || "/";
  const selectedKey = currentPath === "/" ? "dashboard" : currentPath.replace("/", "");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <Layout style={{ minHeight: "calc(100vh - 64px)" }}>
      <Sider collapsible collapsed={collapsed} trigger={null} width={220}>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            paddingInline: collapsed ? 0 : 16,
            color: "#fff",
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          {collapsed ? "D" : "Decomplex Admin"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={getMenuItems()}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            paddingInline: 16,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              type="text"
              onClick={() => setCollapsed((prev) => !prev)}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            />
            <Title level={4} style={{ margin: 0 }}>
              Decomplex Admin Panel
            </Title>
          </div>

          <Space size={16}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>Admin User</span>
            </div>
            <Button danger onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            margin: 16,
            padding: 16,
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <Routes>
            {/*<Route index element={<DashboardPage />} />*/}
            {/*<Route path="users" element={<UsersPage />} />*/}
            {/*<Route path="*" element={<DashboardPage />} />*/}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};
