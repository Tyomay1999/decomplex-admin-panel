import { FC, useMemo } from "react";
import { Avatar, Card, Flex, Space, Tag, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

type TagColor = "default" | "processing" | "success" | "warning" | "error";

type Props = {
  isMobile: boolean;
  displayName: string;
  email: string;
  roleLabel: string;
  userTypeLabel: string;
  companyName: string;
};

const roleColor = (role: string): TagColor => {
  if (role === "admin") return "error";
  if (role === "company_manager") return "processing";
  if (role === "recruiter") return "success";
  return "default";
};

export const ProfileHeaderCard: FC<Props> = ({
  isMobile,
  displayName,
  email,
  roleLabel,
  userTypeLabel,
  companyName,
}) => {
  const { t } = useTranslation("common");
  const headerPadding = isMobile ? 12 : 16;

  const title = displayName !== "—" ? displayName : email;

  const roleText = useMemo(() => {
    if (roleLabel === "—") return "—";
    return t(`profile.roles.${roleLabel}`, { defaultValue: roleLabel });
  }, [t, roleLabel]);

  const userTypeText = useMemo(() => {
    if (userTypeLabel === "—") return "—";
    return t(`profile.userTypes.${userTypeLabel}`, { defaultValue: userTypeLabel });
  }, [t, userTypeLabel]);

  return (
    <Card styles={{ body: { padding: headerPadding } }}>
      <Flex gap={12} align="center" wrap>
        <Avatar size={56} icon={<UserOutlined />} />

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>

          <div style={{ marginTop: 2 }}>
            <Text type="secondary" style={{ wordBreak: "break-word" }}>
              {email}
            </Text>
          </div>

          <div style={{ marginTop: 8 }}>
            <Space size={8} wrap>
              <Tag color={roleColor(roleLabel)}>{roleText}</Tag>
              <Tag>{userTypeText}</Tag>
              {companyName !== "—" ? <Tag>{companyName}</Tag> : null}
            </Space>
          </div>
        </div>
      </Flex>
    </Card>
  );
};
