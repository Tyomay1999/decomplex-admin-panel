import { FC } from "react";
import { Button, Card, Empty, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export const DashboardPage: FC = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
      }}
    >
      <Card style={{ width: "100%", maxWidth: 720 }} styles={{ body: { padding: 18 } }}>
        <Space orientation="vertical" size={12} style={{ width: "100%", textAlign: "center" }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} />

          <div>
            <Title level={4} style={{ margin: 0 }}>
              {t("dashboard.title", { defaultValue: "Dashboard" })}
            </Title>

            <Text type="secondary">
              {t("dashboard.subtitle", {
                defaultValue:
                  "The dashboard is not ready yet. It will show analytics and system overview.",
              })}
            </Text>
          </div>

          <Space wrap style={{ justifyContent: "center" }}>
            <Button type="primary" onClick={() => navigate("/vacancies")}>
              {t("dashboard.actions.goToVacancies", {
                defaultValue: "Go to vacancies",
              })}
            </Button>

            <Button onClick={() => navigate("/users")}>
              {t("dashboard.actions.goToUsers", {
                defaultValue: "Manage users",
              })}
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};
