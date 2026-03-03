import { FC, useMemo } from "react";
import { Button, Card, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { JobType, VacancyDto, VacancyStatus } from "@/services/vacanciesApi";
import type { VacancyTableProps } from "./types";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

const safeDash = (v: string | null | undefined): string =>
  typeof v === "string" && v.trim().length > 0 ? v : "—";

const formatJobType = (
  t: (k: string, opts?: { defaultValue: string }) => string,
  v: JobType,
): string => t(`vacancies.jobType.${v}`, { defaultValue: v });

const formatStatus = (
  t: (k: string, opts?: { defaultValue: string }) => string,
  v: VacancyStatus,
): string => t(`vacancies.status.${v}`, { defaultValue: v });

export const VacancyTable: FC<VacancyTableProps> = ({
  items,
  isFetching,
  onView,
  onApplications,

  statusOptions,
  jobTypeOptions,

  status,
  jobType,

  onChangeStatus,
  onChangeJobType,
}) => {
  const { t } = useTranslation("common");

  const columns = useMemo<ColumnsType<VacancyDto>>(
    () => [
      {
        title: t("vacancies.table.title", { defaultValue: "Title" }),
        dataIndex: "title",
        key: "title",
        render: (v: string) => <Text strong>{v}</Text>,
      },
      {
        title: t("vacancies.table.location", { defaultValue: "Location" }),
        dataIndex: "location",
        key: "location",
        responsive: ["lg"],
        render: (v: string | null | undefined) => safeDash(v),
      },
      {
        title: t("vacancies.table.status", { defaultValue: "Status" }),
        dataIndex: "status",
        key: "status",
        filters: statusOptions.map((o) => ({ text: o.label, value: o.value })),
        filteredValue: status ? [status] : null,
        filterMultiple: false,
        render: (v: VacancyStatus) => <Tag>{formatStatus(t, v)}</Tag>,
      },
      {
        title: t("vacancies.table.jobType", { defaultValue: "Job type" }),
        dataIndex: "jobType",
        key: "jobType",
        responsive: ["lg"],
        filters: jobTypeOptions.map((o) => ({ text: o.label, value: o.value })),
        filteredValue: jobType ? [jobType] : null,
        filterMultiple: false,
        render: (v: JobType) => <Tag>{formatJobType(t, v)}</Tag>,
      },
      {
        title: t("vacancies.table.applications", { defaultValue: "Applications" }),
        key: "applicationsCount",
        align: "center",
        width: 140,
        render: (_value: unknown, row: VacancyDto) => row.applicationsCount ?? 0,
      },
      {
        title: t("vacancies.table.actions", { defaultValue: "Actions" }),
        key: "actions",
        width: 260,
        render: (_value: unknown, row: VacancyDto) => (
          <Space>
            <Button onClick={() => onView(row.id)} data-testid={`vacancy-view-${row.id}`}>
              {t("common.view", { defaultValue: "View" })}
            </Button>
            <Button onClick={() => onApplications(row.id)} data-testid={`vacancy-apps-${row.id}`}>
              {t("vacancies.applications", { defaultValue: "Applications" })}
            </Button>
          </Space>
        ),
      },
    ],
    [t, onView, onApplications, statusOptions, jobTypeOptions, status, jobType],
  );

  const handleChange: TableProps<VacancyDto>["onChange"] = (_pagination, filters) => {
    const statusRaw = Array.isArray(filters.status) ? filters.status[0] : undefined;
    const jobTypeRaw = Array.isArray(filters.jobType) ? filters.jobType[0] : undefined;

    const nextStatus = typeof statusRaw === "string" ? (statusRaw as VacancyStatus) : undefined;
    const nextJobType = typeof jobTypeRaw === "string" ? (jobTypeRaw as JobType) : undefined;

    onChangeStatus(nextStatus);
    onChangeJobType(nextJobType);
  };

  return (
    <Card styles={{ body: { padding: 0 } }} data-testid="vacancies-table-card">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={isFetching && items.length === 0}
        pagination={false}
        onChange={handleChange}
        scroll={{ x: "max-content" }}
        data-testid="vacancies-table"
        rowClassName={(record) => `e2e-vacancy-row e2e-vacancy-row-${record.id}`}
        onRow={(record) => ({
          "data-testid": `vacancies-row-${record.id}`,
        })}
        locale={{
          filterConfirm: t("table.filter.ok", { defaultValue: "OK" }),
          filterReset: t("table.filter.reset", { defaultValue: "Reset" }),
          filterEmptyText: t("table.filter.empty", { defaultValue: "No filters" }),
          filterCheckAll: t("table.filter.checkAll", { defaultValue: "Select all" }),
          filterSearchPlaceholder: t("table.filter.search", { defaultValue: "Search" }),
          emptyText: t("common.noData", { defaultValue: "No data" }),
        }}
      />
    </Card>
  );
};
