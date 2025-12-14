export type Role = "admin" | "company_manager" | "user";

export interface CompanyDto {
  id: string;
  name: string;
}

export interface UserDto {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  company?: CompanyDto | null;
}

const ACCESS_TOKEN_KEY = "accessToken";
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

export const clearAccessTokenCookie = () => {
  setCookie(ACCESS_TOKEN_KEY, "", -1);
};

export const getAccessTokenFromCookie = () => getCookie(ACCESS_TOKEN_KEY);

export const setAccessTokenCookie = (accessToken: string) => {
  setCookie(ACCESS_TOKEN_KEY, accessToken, 7);
};

export const getOrCreateFingerprint = (): string => {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem(FINGERPRINT_KEY);
  if (existing) return existing;

  const fp = crypto.randomUUID();
  window.localStorage.setItem(FINGERPRINT_KEY, fp);
  return fp;
};

export const saveServerFingerprint = (serverHash: string) => {
  if (typeof window === "undefined") return;
  if (!serverHash) return;
  window.localStorage.setItem(FINGERPRINT_KEY, serverHash);
};
