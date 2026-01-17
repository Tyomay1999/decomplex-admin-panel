import { FC, useMemo } from "react";
import { Avatar, Button, Dropdown, Space, Typography } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import type { TopBarProps } from "./types";
import { useTopBarMenu } from "./hooks";

const { Text } = Typography;

export const TopBar: FC<TopBarProps> = ({
  brand,
  currentLanguage,
  onChangeLanguage,
  isDark,
  onToggleTheme,
  user,
  isMobile,
  sidebarToggle,
  onRequestLogout,
}) => {
  const { t } = useTranslation("common");

  const menu = useTopBarMenu({
    t,
    currentLanguage,
    onChangeLanguage,
    isDark,
    onToggleTheme,
    userEmail: user.email,
    onRequestLogout,
  });

  const menuProps: MenuProps = useMemo(
    () => ({
      items: menu.items,
      onClick: menu.onClick,
      selectable: false,
      selectedKeys: [],
    }),
    [menu.items, menu.onClick],
  );

  const showBrand = isMobile;

  return (
    <header className="topbar" role="banner">
      <div className="topbar-inner">
        <div
          className="topbar-left"
          style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
        >
          {sidebarToggle ? (
            <Button
              type="text"
              aria-label={t("nav.toggleMenu", { defaultValue: "Toggle menu" })}
              icon={sidebarToggle.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={sidebarToggle.onToggle}
            />
          ) : null}

          {showBrand ? <Text className="topbar-brand">{brand}</Text> : null}
        </div>

        <div
          className="topbar-right"
          style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 15 }}
        >
          <Dropdown menu={menuProps} trigger={["click"]} placement="bottomRight" destroyOnHidden>
            <Space size={8} style={{ cursor: "pointer" }} align="center">
              <Avatar
                size="default"
                src={user.avatarUrl ?? undefined}
                icon={user.avatarUrl ? undefined : <UserOutlined />}
              />
            </Space>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};
