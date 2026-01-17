import type { JobType, VacancyStatus } from "@/services/vacanciesApi";

export type Option<T extends string> = { label: string; value: T };

export type VacancyFiltersProps = {
  isMobile: boolean;

  q: string;
  status?: VacancyStatus;
  jobType?: JobType;

  statusOptions: Option<VacancyStatus>[];
  jobTypeOptions: Option<JobType>[];

  onApply: () => void;
  onChangeQ: (v: string) => void;
  onChangeStatus: (v?: VacancyStatus) => void;
  onChangeJobType: (v?: JobType) => void;
};
