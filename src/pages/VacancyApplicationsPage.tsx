import * as React from "react";
import { Button, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useParams } from "react-router-dom";

import { useGetVacancyApplicationsQuery } from "@/services/vacanciesApi";

import type { VacancyApplicationDto, ApplicationStatus } from "@/services/vacanciesApi";

const { Title, Text } = Typography;

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export const VacancyApplicationsPage: React.FC = () => {
  const { id } = useParams();
  const vacancyId = String(id || "");

  const [cursor, setCursor] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<VacancyApplicationDto[]>([]);

  const { data, isFetching, isError } = useGetVacancyApplicationsQuery(
    { vacancyId, limit: 20, cursor },
    { skip: !vacancyId },
  );

  React.useEffect(() => {
    if (!data) return;
    if (cursor === null) setItems(data.applications);
    else setItems((prev) => [...prev, ...data.applications]);
  }, [data, cursor]);

  const columns: ColumnsType<VacancyApplicationDto> = [
    {
      title: "Candidate",
      key: "candidate",
      render: (_, row) => (
        <div>
          <Text strong>{row.candidate?.name || "—"}</Text>
          <div style={{ fontSize: 12, opacity: 0.75 }}>{row.candidate?.email}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: ApplicationStatus) => <Tag>{v}</Tag>,
    },
    {
      title: "Applied at",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => formatDate(v),
    },
  ];

  const onLoadMore = () => {
    if (data?.nextCursor) setCursor(data.nextCursor);
  };

  return (
    <div>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Title level={4} style={{ margin: 0 }}>
          Applications
        </Title>

        {isError ? <Text type="danger">Failed to load applications</Text> : null}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={items}
          loading={isFetching && items.length === 0}
          pagination={false}
        />

        <div>
          <Button onClick={onLoadMore} disabled={!data?.nextCursor} loading={isFetching}>
            Load more
          </Button>
        </div>
      </Space>
    </div>
  );
};
