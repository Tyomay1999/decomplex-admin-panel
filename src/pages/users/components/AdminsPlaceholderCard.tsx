import { FC, useMemo } from "react";
import { Card, Empty, Grid, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

const { Text } = Typography;
const { useBreakpoint } = Grid;

type AdminRow = {
  id: string;
  email: string;
  role: "admin";
  createdAt: string;
};

const buildColumns = (
  t: (k: string, opts?: { defaultValue: string }) => string,
): ColumnsType<AdminRow> => [
  {
    title: t("users.table.email", { defaultValue: "Email" }),
    dataIndex: "email",
    key: "email",
    ellipsis: true,
  },
  {
    title: t("users.table.role", { defaultValue: "Role" }),
    dataIndex: "role",
    key: "role",
    width: 140,
  },
  {
    title: t("users.table.createdAt", { defaultValue: "Created at" }),
    dataIndex: "createdAt",
    key: "createdAt",
    width: 220,
  },
];

export const AdminsPlaceholderCard: FC = () => {
  const { t } = useTranslation("common");
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const columns = useMemo(() => buildColumns(t), [t]);

  const empty = (
    <div className="usersEmptyWrap">
      <Empty
        description={t("users.admins.empty", {
          defaultValue: "No data yet (backend not implemented).",
        })}
      />
    </div>
  );

  return (
    <Card className="usersCard" styles={{ body: { padding: isMobile ? 14 : 16 } }}>
      <Space orientation="vertical" size={10} style={{ width: "100%" }}>
        <div style={{ minWidth: 0 }}>
          <Text style={{ fontWeight: 700 }}>
            {t("users.admins.title", { defaultValue: "Admins" })}
          </Text>
          <div>
            <Text type="secondary">
              {t("users.admins.subtitle", {
                defaultValue: "Will be connected after backend endpoint is implemented.",
              })}
            </Text>
          </div>
        </div>

        <Table<AdminRow>
          rowKey="id"
          columns={columns}
          dataSource={[]}
          pagination={false}
          size="small"
          scroll={{ x: 520 }}
          locale={{ emptyText: empty }}
        />
      </Space>
    </Card>
  );
};
