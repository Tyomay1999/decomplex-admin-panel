import { FC } from "react";
import { Grid, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useProfileViewModel } from "./hooks";
import { ProfileDetailsCard, ProfileHeaderCard, ProfileSkeleton } from "./components";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export const ProfilePage: FC = () => {
  const { t } = useTranslation("common");
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { derived } = useProfileViewModel();

  if (derived.isLoadingLike) return <ProfileSkeleton />;

  if (!derived.isAuthed || !derived.hasSession) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            {t("profile.title", { defaultValue: "Profile" })}
          </Title>

          <div style={{ padding: 8 }}>
            {t("profile.notAvailable", { defaultValue: "Profile is not available." })}
          </div>
        </Space>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <Title level={4} style={{ margin: 0 }}>
          {t("profile.title", { defaultValue: "Profile" })}
        </Title>

        <ProfileHeaderCard
          isMobile={isMobile}
          displayName={derived.displayName}
          email={derived.email}
          roleLabel={derived.roleLabel}
          userTypeLabel={derived.userTypeLabel}
          companyName={derived.companyName}
        />

        <ProfileDetailsCard
          companyName={derived.companyName}
          defaultLocale={derived.defaultLocale}
          companyStatus={derived.companyStatus}
          companyId={derived.companyId}
          userId={derived.userId}
          language={derived.languageLabel}
          position={derived.position}
        />
      </Space>
    </div>
  );
};
