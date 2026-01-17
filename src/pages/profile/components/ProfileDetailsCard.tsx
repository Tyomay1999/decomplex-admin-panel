import { FC } from "react";
import { Card, Descriptions, Grid } from "antd";
import { useTranslation } from "react-i18next";

const { useBreakpoint } = Grid;

type Props = {
  companyName: string;
  defaultLocale: string;
  companyStatus: string;
  companyId: string;
  userId: string;
  language: string;
  position: string;
};

export const ProfileDetailsCard: FC<Props> = ({
  companyName,
  defaultLocale,
  companyStatus,
  companyId,
  userId,
  language,
  position,
}) => {
  const { t } = useTranslation("common");
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const padding = isMobile ? 12 : 16;

  return (
    <Card
      styles={{ body: { padding } }}
      title={
        isMobile
          ? undefined
          : t("profile.accountDetails.title", { defaultValue: "Account details" })
      }
    >
      <Descriptions size="small" column={isMobile ? 1 : 2}>
        <Descriptions.Item
          label={t("profile.accountDetails.labels.userId", { defaultValue: "User ID" })}
        >
          {userId}
        </Descriptions.Item>

        <Descriptions.Item
          label={t("profile.accountDetails.labels.companyId", { defaultValue: "Company ID" })}
        >
          {companyId}
        </Descriptions.Item>

        <Descriptions.Item
          label={t("profile.accountDetails.labels.language", { defaultValue: "Language" })}
        >
          {language}
        </Descriptions.Item>

        <Descriptions.Item
          label={t("profile.accountDetails.labels.position", { defaultValue: "Position" })}
        >
          {position}
        </Descriptions.Item>

        <Descriptions.Item
          label={t("profile.accountDetails.labels.company", { defaultValue: "Company" })}
        >
          {companyName}
        </Descriptions.Item>

        <Descriptions.Item
          label={t("profile.accountDetails.labels.defaultLocale", {
            defaultValue: "Default locale",
          })}
        >
          {defaultLocale}
        </Descriptions.Item>

        <Descriptions.Item
          label={t("profile.accountDetails.labels.companyStatus", {
            defaultValue: "Company status",
          })}
        >
          {companyStatus}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
