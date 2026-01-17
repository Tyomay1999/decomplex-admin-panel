import { FC } from "react";
import { Space, Typography } from "antd";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export const UsersHeader: FC = () => {
  const { t } = useTranslation("common");

  return (
    <Space orientation="vertical" size={2} style={{ width: "100%" }}>
      <Title level={4} style={{ margin: 0 }}>
        {t("nav.users", { defaultValue: "Users" })}
      </Title>
      <Text type="secondary">
        {t("users.subtitle", {
          defaultValue:
            "Create admin/recruiter users. Listing will be added after backend support.",
        })}
      </Text>
    </Space>
  );
};
