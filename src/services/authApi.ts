import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LoginPayload, LoginResponseData } from "./authHelpers";
import type { RootState } from "../store";
import i18n from "../i18n";
import {
  getAccessTokenFromCookie,
  getOrCreateFingerprint,
  getRefreshTokenFromCookie,
  setAuthCookies,
} from "./authHelpers";
import { setCredentials, logout } from "../features/auth/authSlice";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:4000/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken || getAccessTokenFromCookie();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const lang = i18n.language || "en";
    headers.set("Accept-Language", lang);

    const fingerprint = getOrCreateFingerprint();
    headers.set("X-Client-Fingerprint", fingerprint);

    headers.set("Content-Type", "application/json");

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = getRefreshTokenFromCookie();

    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const { data } = refreshResult.data as ApiSuccessResponse<LoginResponseData>;

      if (data?.accessToken && data?.refreshToken) {
        setAuthCookies(data.accessToken, data.refreshToken);
        api.dispatch(
          setCredentials({
            accessToken: data.accessToken,
            user: data.user,
          }),
        );

        result = await rawBaseQuery(args, api, extraOptions);
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseData, LoginPayload>({
      query: ({ email, password, fingerprint, language, rememberUser }) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          email,
          password,
          fingerprint,
          language,
          rememberUser,
        },
      }),
      transformResponse: (response: ApiSuccessResponse<LoginResponseData>) => response.data,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          setAuthCookies(data.accessToken, data.refreshToken ?? "");
          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: data.user,
            }),
          );
        } catch {
          // no-op: error is handled in the LoginPage component
        }
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;
