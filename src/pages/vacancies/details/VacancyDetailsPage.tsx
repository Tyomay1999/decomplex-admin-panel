import { FC, useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import { Button, Card, Descriptions, Grid, Space, Spin, Tag, Typography } from "antd";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetVacancyByIdQuery } from "@/services/vacanciesApi";
import type { JobType, VacancyStatus } from "@/services/vacanciesApi";
import type { VacanciesNavState } from "../types";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

type Params = { id?: string };

const safeText = (v: string | null | undefined, dash: string): string => {
  if (typeof v !== "string") return dash;
  const s = v.trim();
  return s.length > 0 ? s : dash;
};

const formatJobType = (
  t: (k: string, opts?: { defaultValue: string }) => string,
  v: JobType | null | undefined,
  dash: string,
): string => {
  if (!v) return dash;
  return t(`vacancies.jobType.${v}`, { defaultValue: String(v) });
};

const formatStatus = (
  t: (k: string, opts?: { defaultValue: string }) => string,
  v: VacancyStatus | null | undefined,
  dash: string,
): string => {
  if (!v) return dash;
  return t(`vacancies.status.${v}`, { defaultValue: String(v) });
};

export const VacancyDetailsPage: FC = () => {
  const { t, i18n } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { id } = useParams<Params>();
  const vacancyId = typeof id === "string" ? id.trim() : "";

  const navState = (location.state ?? null) as VacanciesNavState | null;
  const backTo =
    typeof navState?.from === "string" && navState.from.trim().length > 0
      ? navState.from
      : "/vacancies";

  const dash = t("common.dash", { defaultValue: "—" });

  const createdAtFormatter = useMemo(() => {
    return (iso: string | null | undefined): string => {
      if (typeof iso !== "string") return dash;

      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return dash;

      return d.toLocaleDateString(i18n.language);
    };
  }, [i18n.language, dash]);

  const handleBack = useCallback((): void => {
    navigate(backTo, { replace: true });
  }, [navigate, backTo]);

  if (vacancyId.length === 0) {
    return <Navigate to={backTo} replace />;
  }

  const { data, isLoading, isFetching } = useGetVacancyByIdQuery(vacancyId);
  const loading = isLoading || isFetching;

  const rootStyle: CSSProperties = {
    maxWidth: 980,
    margin: "0 auto",
    width: "100%",
  };

  if (loading) {
    return (
      <div data-testid="vacancy-details-page" style={rootStyle}>
        <div style={{ padding: 16 }}>
          <Spin tip={t("common.loading", { defaultValue: "Loading..." })}>
            <div style={{ minHeight: 120 }} />
          </Spin>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div data-testid="vacancy-details-page" style={rootStyle}>
        <div className="emptyStateWrap" data-testid="vacancy-details-not-found">
          <div className="emptyStateCard">
            <div className="emptyStateIcon" aria-hidden="true">
              !
            </div>

            <div className="emptyStateTitle">
              {t("vacancies.details.notFound", { defaultValue: "Vacancy not found" })}
            </div>

            <div className="emptyStateSubtitle">
              {t("vacancies.details.notFoundHint", {
                defaultValue: "This vacancy may have been deleted or you may not have access.",
              })}
            </div>

            <div className="emptyStateActions">
              <Button onClick={handleBack}>{t("common.back", { defaultValue: "Back" })}</Button>

              <Button type="primary" onClick={() => navigate("/vacancies")}>
                {t("vacancies.actions.goToList", { defaultValue: "Go to vacancies" })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const createdAt = createdAtFormatter(data.createdAt);

  return (
    <div data-testid="vacancy-details-page" style={rootStyle}>
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
          <Title level={4} style={{ margin: 0 }}>
            {data.title}
          </Title>

          <Space size={8}>
            <Tag>{formatStatus(t, data.status, dash)}</Tag>
            <Tag>{formatJobType(t, data.jobType, dash)}</Tag>
          </Space>
        </Space>

        <Card styles={{ body: { padding: isMobile ? 12 : 16 } }}>
          <Descriptions size="small" column={isMobile ? 1 : 2}>
            <Descriptions.Item label={t("vacancies.details.status", { defaultValue: "Status" })}>
              <Text>{formatStatus(t, data.status, dash)}</Text>
            </Descriptions.Item>

            <Descriptions.Item label={t("vacancies.details.jobType", { defaultValue: "Job type" })}>
              <Text>{formatJobType(t, data.jobType, dash)}</Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={t("vacancies.details.location", { defaultValue: "Location" })}
            >
              <Text>{safeText(data.location, dash)}</Text>
            </Descriptions.Item>

            <Descriptions.Item label={t("vacancies.details.created", { defaultValue: "Created" })}>
              <Text>{createdAt}</Text>
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
            {safeText(data.description, dash)}
          </div>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleBack}>{t("common.back", { defaultValue: "Back" })}</Button>
          </div>
        </Card>
      </Space>
    </div>
  );
};
