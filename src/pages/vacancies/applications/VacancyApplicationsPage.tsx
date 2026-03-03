import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Grid, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetVacancyApplicationsQuery } from "@/services/vacanciesApi";
import type { ApplicationStatus, VacancyApplicationDto } from "@/services/vacanciesApi";

import { useVacancyBack } from "../hooks";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type Params = { id?: string };

const safeDash = (v: string | null | undefined): string =>
  typeof v === "string" && v.trim().length > 0 ? v : "—";

const formatStatus = (
  t: (k: string, opts?: { defaultValue: string }) => string,
  v: ApplicationStatus,
): string => t(`applications.status.${v}`, { defaultValue: v });

export const VacancyApplicationsPage: FC = () => {
  const { t, i18n } = useTranslation("common");
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const goBack = useVacancyBack();

  const { id } = useParams<Params>();
  const vacancyId = typeof id === "string" ? id.trim() : "";

  if (vacancyId.length === 0) {
    return <Navigate to="/vacancies" replace />;
  }

  const dash = t("common.dash", { defaultValue: "—" });

  const formatDate = useMemo(() => {
    return (iso?: string): string => {
      if (!iso) return dash;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return dash;
      return d.toLocaleString(i18n.language);
    };
  }, [dash, i18n.language]);

  const [cursor, setCursor] = useState<string | null>(null);
  const [items, setItems] = useState<VacancyApplicationDto[]>([]);

  const { data, isFetching, isError } = useGetVacancyApplicationsQuery({
    vacancyId,
    limit: 20,
    cursor,
  });

  useEffect(() => {
    if (!data) return;
    if (cursor === null) setItems(data.applications);
    else setItems((prev) => [...prev, ...data.applications]);
  }, [data, cursor]);

  const onLoadMore = useCallback((): void => {
    if (data?.nextCursor) setCursor(data.nextCursor);
  }, [data?.nextCursor]);

  const columns: ColumnsType<VacancyApplicationDto> = useMemo(
    () => [
      {
        title: t("applications.table.candidate", { defaultValue: "Candidate" }),
        key: "candidate",
        render: (_value: unknown, row: VacancyApplicationDto) => (
          <div style={{ minWidth: 0 }}>
            <Text strong>{safeDash(row.candidate?.name)}</Text>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{safeDash(row.candidate?.email)}</div>
          </div>
        ),
      },
      {
        title: t("applications.table.status", { defaultValue: "Status" }),
        dataIndex: "status",
        key: "status",
        width: 180,
        render: (v: ApplicationStatus) => <Tag>{formatStatus(t, v)}</Tag>,
      },
      {
        title: t("applications.table.appliedAt", { defaultValue: "Applied at" }),
        dataIndex: "createdAt",
        key: "createdAt",
        width: 220,
        responsive: ["md"],
        render: (v: string) => formatDate(v),
      },
    ],
    [t, formatDate],
  );

  return (
    <div
      data-testid="vacancy-applications-page"
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }} wrap>
          <Title level={4} style={{ margin: 0 }}>
            {t("vacancies.applications", { defaultValue: "Applications" })}
          </Title>

          <Button onClick={goBack}>{t("common.back", { defaultValue: "Back" })}</Button>
        </Space>

        {isError ? (
          <Text type="danger">
            {t("applications.loadFailed", { defaultValue: "Failed to load applications" })}
          </Text>
        ) : null}

        <Card styles={{ body: { padding: isMobile ? 0 : 12 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={items}
            loading={isFetching && items.length === 0}
            pagination={false}
          />
        </Card>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={onLoadMore}
            disabled={!data?.nextCursor}
            loading={isFetching}
            block={isMobile}
          >
            {t("common.loadMore", { defaultValue: "Load more" })}
          </Button>
        </div>
      </Space>
    </div>
  );
};
