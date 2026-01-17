import { FC, useMemo } from "react";
import { Avatar, Divider, Menu, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { MenuItem, RouteKey } from "../types";

const { Text } = Typography;

type Props = {
  collapsed: boolean;
  isMobile: boolean;
  sidebarTitle: string;
  userName: string;
  isDark: boolean;
  userCompanyName: string;
  userRoleLabel: string;
  currentKey: RouteKey;
  menuItems: MenuItem[];
  onMenuClick: MenuProps["onClick"];
};

const getInitials = (value: string): string => {
  const s = value.trim();
  if (s.length === 0) return "U";

  const parts = s.split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  const first = parts[0].slice(0, 1).toUpperCase();
  const last = parts[parts.length - 1].slice(0, 1).toUpperCase();
  return `${first}${last}`;
};

export const Sidebar: FC<Props> = ({
  collapsed,
  isMobile,
  sidebarTitle,
  userName,
  userCompanyName,
  userRoleLabel,
  currentKey,
  menuItems,
  isDark,
  onMenuClick,
}) => {
  const initials = useMemo(() => getInitials(userName), [userName]);

  const showUserBlock = !(collapsed && !isMobile);

  const titleColor = isDark ? "#fff" : "rgba(15,23,42,0.92)";
  const userBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)";
  const dividerColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)";

  return (
    <div>
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          paddingInline: collapsed ? 0 : 16,
          color: titleColor,
          fontWeight: 700,
          fontSize: 16,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        aria-label="sidebar-header"
      >
        {sidebarTitle}
      </div>

      <div style={{ background: userBg }}>
        {showUserBlock ? (
          <div
            style={{
              padding: 16,
              display: "flex",
              gap: 12,
              alignItems: "center",
              justifyContent: "flex-start",
              minWidth: 0,
            }}
            aria-label="sidebar-user"
          >
            <Avatar style={{ flex: "0 0 auto" }} icon={<UserOutlined />}>
              {initials}
            </Avatar>

            <div style={{ minWidth: 0 }}>
              <Text strong style={{ display: "block", color: titleColor }}>
                {userName}
              </Text>

              <Text
                type="secondary"
                style={{
                  display: "block",
                  fontSize: 12,
                  maxWidth: 190,
                  opacity: 0.9,
                }}
                ellipsis
                title={`${userCompanyName} • ${userRoleLabel}`}
              >
                {userCompanyName} • {userRoleLabel}
              </Text>
            </div>
          </div>
        ) : null}
      </div>

      <Divider style={{ margin: 0, borderColor: dividerColor }} />

      <Menu
        theme={isDark ? "dark" : "light"}
        mode="inline"
        selectedKeys={[currentKey]}
        items={menuItems}
        onClick={onMenuClick}
      />
    </div>
  );
};
