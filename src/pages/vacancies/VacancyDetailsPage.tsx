import * as React from "react";
import { Button, Card, Descriptions, Grid, Space, Spin, Tag, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetVacancyByIdQuery } from "@/services/vacanciesApi";
import type { JobType, VacancyStatus } from "@/services/vacanciesApi";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

type Params = { id: string };

const safeDash = (v: string | null | undefined): string => (v?.trim() ? v : "—");

const formatJobType = (
    t: (k: string, opts?: { defaultValue: string }) => string,
    v: JobType,
): string => t(`vacancies.jobType.${v}`, { defaultValue: v });

const formatStatus = (
    t: (k: string, opts?: { defaultValue: string }) => string,
    v: VacancyStatus,
): string => t(`vacancies.status.${v}`, { defaultValue: v });

export const VacancyDetailsPage: React.FC = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { id } = useParams<Params>();
  const vacancyId = typeof id === "string" ? id : "";

  const { data, isLoading } = useGetVacancyByIdQuery(vacancyId, { skip: vacancyId.length === 0 });

  if (isLoading) {
    return (
        <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
          <Spin />
        </div>
    );
  }

  if (!data) {
    return (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            {t("vacancies.details.notFound", { defaultValue: "Not found" })}
          </Title>
          <Button onClick={() => navigate("/vacancies")}>
            {t("nav.vacancies", { defaultValue: "Vacancies" })}
          </Button>
        </Space>
    );
  }

  const createdAt = new Date(data.createdAt).toLocaleString();

  return (
      <div style={{ maxWidth: 980 }}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
            <Title level={4} style={{ margin: 0 }}>
              {data.title}
            </Title>

            <Space size={8}>
              <Tag>{formatStatus(t, data.status)}</Tag>
              <Tag>{formatJobType(t, data.jobType)}</Tag>
            </Space>
          </Space>

          <Card styles={{ body: { padding: isMobile ? 12 : 16 } }}>
            <Descriptions size="small" column={isMobile ? 1 : 2}>
              <Descriptions.Item
                  label={t("vacancies.details.status", { defaultValue: "Status" })}
              >
                <Text>{formatStatus(t, data.status)}</Text>
              </Descriptions.Item>

              <Descriptions.Item
                  label={t("vacancies.details.jobType", { defaultValue: "Job type" })}
              >
                <Text>{formatJobType(t, data.jobType)}</Text>
              </Descriptions.Item>

              <Descriptions.Item
                  label={t("vacancies.details.location", { defaultValue: "Location" })}
              >
                <Text>{safeDash(data.location)}</Text>
              </Descriptions.Item>

              <Descriptions.Item
                  label={t("vacancies.details.created", { defaultValue: "Created" })}
              >
                <Text>{createdAt}</Text>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{data.description}</div>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={() => navigate("/vacancies")}>
                {t("nav.vacancies", { defaultValue: "Vacancies" })}
              </Button>
            </div>
          </Card>
        </Space>
      </div>
  );
};
