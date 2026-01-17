import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/services/baseQueryWithReauth";
import type { ApiSuccessResponse } from "@/services/baseQueryWithReauth";

export type VacancyStatus = "active" | "archived";
export type JobType = "full_time" | "part_time" | "remote" | "hybrid";

export type VacancyDto = {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  status: VacancyStatus;
  jobType: JobType;
  createdAt: string;

  applicationsCount?: number;
};

export type GetVacanciesQuery = {
  companyId?: string;
  q?: string;
  status?: VacancyStatus;
  jobType?: JobType;
  limit?: number;
  cursor?: string | null;
};

export type GetVacanciesResponse = {
  vacancies: VacancyDto[];
  nextCursor: string | null;
};

export type GetVacancyByIdResponse = {
  vacancy: VacancyDto;
};

export type CreateVacancyPayload = {
  title: string;
  description: string;
  location?: string;
  jobType: JobType;
};

export type ApplicationStatus = "new" | "reviewed" | "accepted" | "rejected";

export type CandidateDto = {
  id: string;
  email: string;
  name?: string | null;
};

export type VacancyApplicationDto = {
  id: string;
  candidate: CandidateDto;
  status: ApplicationStatus;
  createdAt: string;
};

export type GetVacancyApplicationsQuery = {
  vacancyId: string;
  limit?: number;
  cursor?: string | null;
};

export type GetVacancyApplicationsResponse = {
  applications: VacancyApplicationDto[];
  nextCursor: string | null;
};

export const vacanciesApi = createApi({
  reducerPath: "vacanciesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Vacancies"],
  endpoints: (builder) => ({
    getVacancies: builder.query<GetVacanciesResponse, GetVacanciesQuery>({
      query: (params) => ({
        url: "/vacancies",
        method: "GET",
        params,
      }),
      transformResponse: (res: ApiSuccessResponse<GetVacanciesResponse>) => res.data,
      providesTags: ["Vacancies"],
    }),

    getVacancyById: builder.query<VacancyDto, string>({
      query: (id) => ({
        url: `/vacancies/${id}`,
        method: "GET",
      }),
      transformResponse: (res: ApiSuccessResponse<GetVacancyByIdResponse>) => res.data.vacancy,
    }),

    getVacancyApplications: builder.query<
      GetVacancyApplicationsResponse,
      GetVacancyApplicationsQuery
    >({
      query: ({ vacancyId, limit = 20, cursor = null }) => ({
        url: `/vacancies/${vacancyId}/applications`,
        method: "GET",
        params: { limit, cursor },
      }),
      transformResponse: (res: ApiSuccessResponse<GetVacancyApplicationsResponse>) => res.data,
    }),

    createVacancy: builder.mutation<VacancyDto, CreateVacancyPayload>({
      query: (body) => ({
        url: "/vacancies",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiSuccessResponse<VacancyDto>) => res.data,
      invalidatesTags: ["Vacancies"],
    }),
  }),
});

export const {
  useGetVacancyApplicationsQuery,
  useGetVacanciesQuery,
  useGetVacancyByIdQuery,
  useCreateVacancyMutation,
} = vacanciesApi;
