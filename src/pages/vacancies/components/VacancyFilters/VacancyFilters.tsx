import { FC, useCallback } from "react";
import { Button, Card, Flex, Input, Select } from "antd";
import type { VacancyFiltersProps } from "./types";
import type { JobType, VacancyStatus } from "@/services";
import { useTranslation } from "react-i18next";

export const VacancyFilters: FC<VacancyFiltersProps> = ({
  isMobile,
  q,
  status,
  jobType,
  statusOptions,
  jobTypeOptions,
  onChangeQ,
  onChangeStatus,
  onChangeJobType,
  onApply,
}) => {
  const { t } = useTranslation("common");

  const handleApply = useCallback(() => {
    onApply();
  }, [onApply]);

  return (
    <Card styles={{ body: { padding: isMobile ? 12 : 16 } }} style={{ marginBottom: 12 }}>
      <Flex vertical={isMobile} gap={12} align={isMobile ? "stretch" : "center"} wrap>
        <Input
          spellCheck={false}
          placeholder={t("common.search", { defaultValue: "Search" })}
          value={q}
          onChange={(e) => onChangeQ(e.target.value)}
          allowClear
          style={{ width: isMobile ? "100%" : 260 }}
        />

        <Select<VacancyStatus>
          allowClear
          placeholder={t("vacancies.filters.status", { defaultValue: "Status" })}
          value={status}
          onChange={(v) => onChangeStatus(v)}
          options={statusOptions}
          style={{ width: isMobile ? "100%" : 200 }}
        />

        <Select<JobType>
          allowClear
          placeholder={t("vacancies.filters.jobType", { defaultValue: "Job type" })}
          value={jobType}
          onChange={(v) => onChangeJobType(v)}
          options={jobTypeOptions}
          style={{ width: isMobile ? "100%" : 220 }}
        />

        <Button onClick={handleApply}>{t("common.apply", { defaultValue: "Apply" })}</Button>
      </Flex>
    </Card>
  );
};
