import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/services/baseQueryWithReauth";
import type { ApiSuccessResponse } from "@/services/baseQueryWithReauth";
import { setTokenOnly } from "@/features/auth/authSlice";
import {
  getOrCreateFingerprint,
  saveServerFingerprint,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/services/authHelpers";
import type { CurrentSessionDto, MeResponseData, UserDto } from "@/features/auth/types";
import type { Lang } from "@/i18n";

export type CompanyUserRole = "admin" | "recruiter";

export type LoginPayload = {
  email: string;
  password: string;
  language: string;
  rememberUser: boolean;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken?: string;
  user: UserDto;
  fingerprintHash?: string;
};

export interface RegisterCompanyUserPayload {
  email: string;
  password: string;
  role: CompanyUserRole;
  position?: string;
  language: Lang;
}

export interface RegisterCompanyUserResponseData {
  id: string;
  email: string;
  role: CompanyUserRole;
  position: string | null;
  language: Lang;
  companyId: string;
}

type CurrentResponse = ApiSuccessResponse<CurrentSessionDto>;

const pickUserFromMe = (data: MeResponseData): UserDto => {
  if ("user" in data) {
    return {
      ...data.user,
      company: data.company ?? null,
    };
  }

  return data;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseData, LoginPayload>({
      query: ({ email, password, language, rememberUser }) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          email,
          password,
          language,
          rememberUser,
          fingerprint: getOrCreateFingerprint(),
        },
      }),
      transformResponse: (res: ApiSuccessResponse<LoginResponseData>) => res.data,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          if (data.fingerprintHash) saveServerFingerprint(data.fingerprintHash);

          const days = arg.rememberUser ? 30 : 7;
          setAccessTokenCookie(data.accessToken, days);

          if (typeof data.refreshToken === "string" && data.refreshToken.trim().length > 0) {
            setRefreshTokenCookie(data.refreshToken, days);
          }

          dispatch(setTokenOnly({ accessToken: data.accessToken }));
        } catch {
          void 0;
        }
      },
    }),

    me: builder.query<UserDto, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
      transformResponse: (res: ApiSuccessResponse<MeResponseData>): UserDto =>
        pickUserFromMe(res.data),
    }),

    current: builder.query<CurrentSessionDto, void>({
      query: () => ({ url: "/auth/current", method: "GET" }),
      transformResponse: (res: CurrentResponse) => res.data,
    }),

    logout: builder.mutation<void, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: "/auth/logout",
        method: "PATCH",
        body: { refreshToken },
      }),
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
      transformResponse: (res: ApiSuccessResponse<RegisterCompanyUserResponseData>) => res.data,
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useLazyMeQuery,
  useCurrentQuery,
  useLazyCurrentQuery,
  useRegisterCompanyUserMutation,
} = authApi;
