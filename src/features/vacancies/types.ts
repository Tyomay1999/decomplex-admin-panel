export type VacancyStatus = "active" | "archived" | string;
export type JobType = "remote" | "full_time" | "hybrid" | "office" | string;

export type VacancyDto = {
  id: string;
  companyId: string;
  createdById: string;

  title: string;
  description?: string | null;

  jobType: JobType;
  location?: string | null;

  salaryFrom?: number | null;
  salaryTo?: number | null;

  status: VacancyStatus;

  createdAt: string;
  updatedAt: string;
};

export type GetVacanciesParams = {
  status?: string;
  jobType?: string;
  companyId?: string;
};

export type CreateVacancyDto = {
  title: string;
  description?: string;
  jobType: string;
  location?: string;
  salaryFrom?: number;
  salaryTo?: number;
};

export type UpdateVacancyDto = Partial<CreateVacancyDto>;
