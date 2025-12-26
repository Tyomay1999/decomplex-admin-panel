import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiSuccessResponse } from "@/services/baseApi";
import { baseQueryWithReauth } from "@/services/baseApi";
import type { VacancyDto, GetVacanciesParams, CreateVacancyDto, UpdateVacancyDto } from "./types";

export const vacanciesApi = createApi({
  reducerPath: "vacanciesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Vacancies"],
  endpoints: (builder) => ({
    getVacancies: builder.query<VacancyDto[], GetVacanciesParams | void>({
      query: (params) => ({
        url: "/vacancies",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (res: ApiSuccessResponse<{ vacancies: VacancyDto[] }>) =>
        res.data.vacancies,
      providesTags: (result) =>
        result
          ? [
              ...result.map((v) => ({ type: "Vacancies" as const, id: v.id })),
              { type: "Vacancies" as const, id: "LIST" },
            ]
          : [{ type: "Vacancies" as const, id: "LIST" }],
    }),

    createVacancy: builder.mutation<VacancyDto, CreateVacancyDto>({
      query: (body) => ({ url: "/vacancies", method: "POST", body }),
      transformResponse: (res: ApiSuccessResponse<VacancyDto>) => res.data,
      invalidatesTags: [{ type: "Vacancies", id: "LIST" }],
    }),

    updateVacancy: builder.mutation<VacancyDto, { id: string; body: UpdateVacancyDto }>({
      query: ({ id, body }) => ({ url: `/vacancies/${id}`, method: "PATCH", body }),
      transformResponse: (res: ApiSuccessResponse<VacancyDto>) => res.data,
      invalidatesTags: (_r, _e, arg) => [{ type: "Vacancies", id: arg.id }],
    }),

    archiveVacancy: builder.mutation<{ success: boolean } | void, string>({
      query: (id) => ({ url: `/vacancies/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Vacancies", id: "LIST" }],
    }),
  }),
});

export const {
  useGetVacanciesQuery,
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
  useArchiveVacancyMutation,
} = vacanciesApi;
