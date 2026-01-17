import { FC } from "react";
import { Button, Card, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export const EventsPage: FC = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <Card styles={{ body: { padding: 16 } }}>
        <Space orientation="vertical" size={10} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            {t("events.title", { defaultValue: "Events" })}
          </Title>

          <Text type="secondary">
            {t("events.subtitle", {
              defaultValue:
                "This section is not implemented yet. We’ll add it after backend support.",
            })}
          </Text>

          <Space wrap style={{ marginTop: 6 }}>
            <Button type="primary" onClick={() => navigate("/vacancies")}>
              {t("events.actions.goToVacancies", { defaultValue: "Go to vacancies" })}
            </Button>

            <Button onClick={() => navigate("/profile")}>
              {t("events.actions.goToProfile", { defaultValue: "Open profile" })}
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};
