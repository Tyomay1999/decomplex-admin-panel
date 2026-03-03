import type { JobType, VacancyStatus } from "@/services/vacanciesApi";

export type VacanciesNavState = {
  from?: string;
};

export type VacancyFiltersState = {
  q: string;
  status?: VacancyStatus;
  jobType?: JobType;
};
