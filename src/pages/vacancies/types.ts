import type { JobType, VacancyStatus } from "@/services";

export type VacanciesNavState = {
  from?: string;
};

export type VacancyFiltersState = {
  q: string;
  status?: VacancyStatus;
  jobType?: JobType;
};
