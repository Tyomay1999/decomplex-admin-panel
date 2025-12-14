import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState } from "@/store";
import i18n from "@/i18n";
import { setCredentials, localLogout } from "@/features/auth/authSlice";
import {
  getAccessTokenFromCookie,
  getOrCreateFingerprint,
  setAccessTokenCookie,
  saveServerFingerprint,
} from "./authHelpers";

// ENV
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;
const API_PREFIX: string = import.meta.env.VITE_API_PREFIX ?? "/api";

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

export interface RegisterCompanyUserPayload {
  email: string;
  password: string;
  role: CompanyUserRole;
  position?: string;
  language: LocaleCode;
}

export interface RegisterCompanyUserResponseData {
  id: string;
  email: string;
  role: CompanyUserRole;
  position: string | null;
  language: LocaleCode;
  companyId: string;
}

type Role = "admin" | "company_manager" | "user";

type CompanyDto = {
  id: string;
  name: string;
};

export type UserDto = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  company?: CompanyDto | null;
};

export type LoginPayload = {
  email: string;
  password: string;
  language: string;
  rememberUser: boolean;
};

export type LoginResponseData = {
  accessToken: string;
  user: UserDto;
  fingerprintHash?: string;
};

type RefreshResponseData = LoginResponseData;

let refreshPromise: Promise<void> | null = null;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}${API_PREFIX}`,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken || getAccessTokenFromCookie();

    if (token) headers.set("Authorization", `Bearer ${token}`);

    headers.set("Accept-Language", i18n.language || "en");
    headers.set("X-Client-Fingerprint", getOrCreateFingerprint());

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const refreshResult = await rawBaseQuery(
          { url: "/auth/refresh", method: "POST" },
          api,
          extraOptions,
        );

        if (!refreshResult.data) {
          throw new Error("Refresh failed: empty response");
        }

        const payload = refreshResult.data as ApiSuccessResponse<RefreshResponseData>;
        const { data } = payload;

        if (!data?.accessToken) {
          throw new Error("Refresh failed: no accessToken");
        }

        setAccessTokenCookie(data.accessToken);

        if (data.fingerprintHash) {
          saveServerFingerprint(data.fingerprintHash);
        }

        api.dispatch(
          setCredentials({
            accessToken: data.accessToken,
            user: data.user,
          }),
        );
      })().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;
      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      api.dispatch(localLogout());
    }
  }

  return result;
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
      transformResponse: (response: ApiSuccessResponse<LoginResponseData>) => response.data,
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          if (data.fingerprintHash) {
            saveServerFingerprint(data.fingerprintHash);
          }

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

    current: builder.query<ApiSuccessResponse<{ user: UserDto }>, void>({
      query: () => ({ url: "/auth/current", method: "GET" }),
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
  }),
});

export const {
  useLoginMutation,
  useCurrentQuery,
  useLogoutMutation,
  useRegisterCompanyUserMutation,
} = authApi;
