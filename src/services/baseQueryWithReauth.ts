import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState } from "@/store";
import i18n from "@/i18n";
import { setTokenOnly, localLogout } from "@/features/auth/authSlice";
import type { UserDto } from "@/features/auth/types";
import {
  getAccessTokenFromCookie,
  getOrCreateFingerprint,
  getRefreshTokenFromCookie,
  saveServerFingerprint,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  clearAccessTokenCookie,
} from "@/services/authHelpers";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;
const API_PREFIX: string = import.meta.env.VITE_API_PREFIX ?? "/api";

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

type RefreshResponseData = {
  accessToken: string;
  refreshToken?: string;
  user: UserDto;
  fingerprintHash?: string;
};

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

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;

  const refreshToken = getRefreshTokenFromCookie();
  const hasRefresh = typeof refreshToken === "string" && refreshToken.trim().length > 0;

  if (!hasRefresh) {
    api.dispatch(localLogout());
    return result;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (!refreshResult.data) throw new Error("Refresh failed: empty response");

      const payload = refreshResult.data as ApiSuccessResponse<RefreshResponseData>;
      const { data } = payload;

      if (!data?.accessToken) throw new Error("Refresh failed: no accessToken");

      setAccessTokenCookie(data.accessToken, 7);

      if (typeof data.refreshToken === "string" && data.refreshToken.trim().length > 0) {
        setRefreshTokenCookie(data.refreshToken, 30);
      }

      if (data.fingerprintHash) saveServerFingerprint(data.fingerprintHash);

      api.dispatch(setTokenOnly({ accessToken: data.accessToken }));
    })().finally(() => {
      refreshPromise = null;
    });
  }

  try {
    await refreshPromise;
    result = await rawBaseQuery(args, api, extraOptions);
  } catch {
    clearAccessTokenCookie();
    clearRefreshTokenCookie();
    api.dispatch(localLogout());
  }

  return result;
};
