import { FC } from "react";
import { Button, Card, Descriptions, Empty, Flex, Space, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { JobType, VacancyStatus } from "@/services";
import type { VacancyMobileListProps } from "./types";

const { Text } = Typography;

const formatJobType = (
  t: (k: string, opts?: { defaultValue: string }) => string,
  v: JobType,
): string => t(`vacancies.jobType.${v}`, { defaultValue: v });

const formatStatus = (
  t: (k: string, opts?: { defaultValue: string }) => string,
  v: VacancyStatus,
): string => t(`vacancies.status.${v}`, { defaultValue: v });

const safeDash = (v: string | null | undefined): string =>
  typeof v === "string" && v.trim().length > 0 ? v : "—";

export const VacancyMobileList: FC<VacancyMobileListProps> = ({
  items,
  isFetching,
  isError,
  hasMore,
  onView,
  onApplications,
  onLoadMore,
}) => {
  const { t } = useTranslation("common");

  return (
    <Space orientation="vertical" size={10} style={{ width: "100%" }}>
      {items.length === 0 ? (
        <Card styles={{ body: { padding: 12 } }}>
          <Empty
            description={
              isError
                ? t("common.error", { defaultValue: "Something went wrong." })
                : t("vacancies.empty", { defaultValue: "No vacancies found." })
            }
          />
        </Card>
      ) : (
        items.map((v) => (
          <Card
            key={v.id}
            styles={{ body: { padding: 12 } }}
            title={<Text strong>{v.title}</Text>}
            extra={<Tag>{formatStatus(t, v.status)}</Tag>}
          >
            <Descriptions size="small" column={1}>
              <Descriptions.Item
                label={t("vacancies.table.location", { defaultValue: "Location" })}
              >
                {safeDash(v.location)}
              </Descriptions.Item>

              <Descriptions.Item label={t("vacancies.table.jobType", { defaultValue: "Job type" })}>
                <Tag>{formatJobType(t, v.jobType)}</Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={t("vacancies.table.applications", { defaultValue: "Applications" })}
              >
                {v.applicationsCount ?? 0}
              </Descriptions.Item>
            </Descriptions>

            <Flex gap={10} style={{ marginTop: 10 }}>
              <Button block onClick={() => onView(v.id)}>
                {t("common.view", { defaultValue: "View" })}
              </Button>
              <Button block onClick={() => onApplications(v.id)}>
                {t("vacancies.applications", { defaultValue: "Applications" })}
              </Button>
            </Flex>
          </Card>
        ))
      )}

      <Flex style={{ marginTop: 2 }}>
        <Button onClick={onLoadMore} disabled={!hasMore} loading={isFetching} block>
          {t("common.loadMore", { defaultValue: "Load more" })}
        </Button>
      </Flex>
    </Space>
  );
};
