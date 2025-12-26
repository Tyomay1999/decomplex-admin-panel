import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/services/baseApi";
import type { ApiSuccessResponse } from "@/services/baseApi";
import { getOrCreateFingerprint, setAccessTokenCookie, saveServerFingerprint } from "./authHelpers";
import { setCredentials, localLogout } from "@/features/auth/authSlice";

import type {
  UserDto,
  Role,
  CompanyUserRole,
  LocaleCode,
  CompanyDto,
  UserType,
} from "@/types/auth";

export interface RegisterCompanyUserPayload {
  email: string;
  password: string;
  role: CompanyUserRole;
  position?: string;
  language: LocaleCode;
}

export type MeResponseData = {
  userType: UserType;
  user: UserDto;
  company?: CompanyDto;
};

export interface RegisterCompanyUserResponseData {
  id: string;
  email: string;
  role: CompanyUserRole;
  position: string | null;
  language: LocaleCode;
  companyId: string;
}

export type LoginPayload = {
  email: string;
  password: string;
  language: string;
  rememberUser: boolean;
  fingerprint: string;
};

export type LoginResponseData = {
  accessToken: string;
  user: UserDto;
  fingerprintHash?: string;
};

export type CurrentResponseData = {
  user: UserDto;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseData, LoginPayload>({
      query: ({ email, password, language, rememberUser, fingerprint }) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          email,
          password,
          language,
          rememberUser,
          fingerprint,
        },
      }),
      transformResponse: (response: ApiSuccessResponse<LoginResponseData>) => response.data,
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          if (data.fingerprintHash) saveServerFingerprint(data.fingerprintHash);

          setAccessTokenCookie(data.accessToken);

          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: data.user,
            }),
          );
        } catch {
          // handled in UI
        }
      },
    }),

    current: builder.query<CurrentResponseData, void>({
      query: () => ({ url: "/auth/current", method: "GET" }),
      transformResponse: (response: ApiSuccessResponse<CurrentResponseData>) => response.data,
    }),

    logout: builder.mutation<{ success: boolean } | void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "PATCH",
        body: { refreshToken: getOrCreateFingerprint() },
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(localLogout());
        }
      },
    }),

    registerCompanyUser: builder.mutation<
      RegisterCompanyUserResponseData,
      RegisterCompanyUserPayload
    >({
      query: (body) => ({
        url: "/auth/register/company-user",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSuccessResponse<RegisterCompanyUserResponseData>) =>
        response.data,
    }),
    me: builder.query<MeResponseData, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
      transformResponse: (response: ApiSuccessResponse<MeResponseData>) => response.data,
    }),
  }),
});

export const {
  useLoginMutation,
  useCurrentQuery,
  useLogoutMutation,
  useMeQuery,
  useRegisterCompanyUserMutation,
} = authApi;

export type { Role, CompanyUserRole, LocaleCode };
