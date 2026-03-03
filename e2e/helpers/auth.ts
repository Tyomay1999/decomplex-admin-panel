import type { APIRequestContext, Page } from "@playwright/test";
import { e2eEnv } from "./env";
import { apiUrl } from "./api";
import type { ApiSuccessResponse, LoginPayload, LoginResponseData } from "./types";

type PwCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
};

const originHost = (baseUrl: string): string => {
  const url = new URL(baseUrl);
  return url.hostname;
};

const ensureCreds = (
  creds: { email: string; password: string } | null,
  label: string,
): { email: string; password: string } => {
  if (!creds) throw new Error(`Missing ${label} creds in .env.e2e`);
  return creds;
};

export const apiLogin = async (
  request: APIRequestContext,
  creds: { email: string; password: string },
): Promise<LoginResponseData> => {
  const payload: LoginPayload = {
    email: creds.email,
    password: creds.password,
    language: "en",
    rememberUser: true,
  };

  const res = await request.post(apiUrl("/auth/login"), { data: payload });

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Login failed: ${res.status()} ${body}`);
  }

  const json = (await res.json()) as ApiSuccessResponse<LoginResponseData>;

  const data = json?.data;

  if (!data || typeof data !== "object") {
    throw new Error("Login failed: invalid response shape");
  }

  if (typeof data.accessToken !== "string" || data.accessToken.trim().length === 0) {
    throw new Error("Login failed: missing accessToken in response");
  }

  return data;
};

export const setAuthCookiesAndFingerprint = async (
  page: Page,
  baseUrl: string,
  tokens: LoginResponseData,
): Promise<void> => {
  const domain = originHost(baseUrl);

  const cookies: PwCookie[] = [
    { name: "dc_accessToken", value: tokens.accessToken, domain, path: "/" },
  ];

  if (typeof tokens.refreshToken === "string" && tokens.refreshToken.trim().length > 0) {
    cookies.push({ name: "dc_refreshToken", value: tokens.refreshToken, domain, path: "/" });
  }

  await page.context().addCookies(cookies);

  const fp =
    typeof tokens.fingerprintHash === "string" && tokens.fingerprintHash.trim().length > 0
      ? tokens.fingerprintHash
      : null;

  if (fp) {
    await page.addInitScript((v: string) => {
      window.localStorage.setItem("dc_fingerprint", v);
    }, fp);
  }
};

export const loginAsAdmin = async (request: APIRequestContext, page: Page): Promise<void> => {
  const creds = ensureCreds(e2eEnv.admin, "admin");
  const tokens = await apiLogin(request, creds);
  await setAuthCookiesAndFingerprint(page, e2eEnv.baseURL, tokens);
};

export const loginAsRecruiter = async (request: APIRequestContext, page: Page): Promise<void> => {
  const creds = ensureCreds(e2eEnv.recruiter, "recruiter");
  const tokens = await apiLogin(request, creds);
  await setAuthCookiesAndFingerprint(page, e2eEnv.baseURL, tokens);
};
