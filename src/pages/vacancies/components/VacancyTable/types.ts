import type { JobType, VacancyDto, VacancyStatus } from "@/services/vacanciesApi";

export type Option<T extends string> = { label: string; value: T };

export type VacancyTableProps = {
  items: VacancyDto[];
  isFetching: boolean;

  onView: (id: string) => void;
  onApplications: (id: string) => void;

  statusOptions: Option<VacancyStatus>[];
  jobTypeOptions: Option<JobType>[];

  status?: VacancyStatus;
  jobType?: JobType;

  onChangeStatus: (v?: VacancyStatus) => void;
  onChangeJobType: (v?: JobType) => void;
};
