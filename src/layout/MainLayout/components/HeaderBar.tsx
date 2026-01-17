import { FC } from "react";
import { Avatar, Button, Space, Typography } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

type Props = {
  isMobile: boolean;
  collapsed: boolean;
  headerTitle: string;
  userEmailLabel: string;
  onToggle: () => void;
};

export const HeaderBar: FC<Props> = ({
  isMobile,
  collapsed,
  headerTitle,
  userEmailLabel,
  onToggle,
}) => {
  return (
    <div
      style={{
        paddingInline: isMobile ? 12 : 16,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <Button
          type="text"
          onClick={onToggle}
          icon={
            isMobile ? (
              <MenuUnfoldOutlined />
            ) : collapsed ? (
              <MenuUnfoldOutlined />
            ) : (
              <MenuFoldOutlined />
            )
          }
          aria-label="toggle-menu"
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
          {headerTitle}
        </Title>
      </div>

      <Space size={12} align="center">
        {isMobile ? (
          <Avatar size="small" icon={<UserOutlined />} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span
              style={{
                maxWidth: 220,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={userEmailLabel}
            >
              {userEmailLabel}
            </span>
          </div>
        )}
      </Space>
    </div>
  );
};
