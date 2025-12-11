export type LoginPayload = {
  email: string;
  password: string;
  fingerprint: string;
  language: string;
  rememberUser: boolean;
};

export type UserDto = {
  id: string;
  email: string;
  role: string;
  language: string;
  position?: string;
};

export type CompanyDto = {
  id: string;
  name: string;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
  company: CompanyDto;
};

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const FINGERPRINT_KEY = "browserFingerprint";

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
};

export const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )};expires=${date.toUTCString()};path=/;SameSite=Lax`;
};

export const clearAuthCookies = () => {
  setCookie(ACCESS_TOKEN_KEY, "", -1);
  setCookie(REFRESH_TOKEN_KEY, "", -1);
};

export const getAccessTokenFromCookie = () => getCookie(ACCESS_TOKEN_KEY);
export const getRefreshTokenFromCookie = () => getCookie(REFRESH_TOKEN_KEY);

export const setAuthCookies = (accessToken: string, refreshToken?: string) => {
  setCookie(ACCESS_TOKEN_KEY, accessToken, 7);
  if (refreshToken) {
    setCookie(REFRESH_TOKEN_KEY, refreshToken, 30);
  }
};

export const getOrCreateFingerprint = (): string => {
  if (typeof window === "undefined") return "server-fingerprint";
  let fp = window.localStorage.getItem(FINGERPRINT_KEY);
  if (!fp) {
    fp = crypto.randomUUID();
    window.localStorage.setItem(FINGERPRINT_KEY, fp);
  }
  return fp;
};
