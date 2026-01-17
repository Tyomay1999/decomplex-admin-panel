const ACCESS_TOKEN_KEY = "dc_accessToken";
const REFRESH_TOKEN_KEY = "dc_refreshToken";
const FINGERPRINT_KEY = "dc_fingerprint";

const canUseDom = (): boolean => typeof document !== "undefined";
const canUseWindow = (): boolean => typeof window !== "undefined";

export const getCookie = (name: string): string | null => {
  if (!canUseDom()) return null;

  const safe = name.replace(/([$?*|{}()[\]\\/+^])/g, "\\$1");
  const match = document.cookie.match(new RegExp(`(?:^|; )${safe}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : null;
};

export const setCookie = (name: string, value: string, days = 7): void => {
  if (!canUseDom()) return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

  const secure = window.location.protocol === "https:" ? ";Secure" : "";

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )};expires=${date.toUTCString()};path=/;SameSite=Lax${secure}`;
};

export const getAccessTokenFromCookie = (): string | null => getCookie(ACCESS_TOKEN_KEY);

export const setAccessTokenCookie = (accessToken: string, days = 7): void => {
  setCookie(ACCESS_TOKEN_KEY, accessToken, days);
};

export const clearAccessTokenCookie = (): void => {
  setCookie(ACCESS_TOKEN_KEY, "", -1);
};

export const getRefreshTokenFromCookie = (): string | null => getCookie(REFRESH_TOKEN_KEY);

export const setRefreshTokenCookie = (refreshToken: string, days = 30): void => {
  setCookie(REFRESH_TOKEN_KEY, refreshToken, days);
};

export const clearRefreshTokenCookie = (): void => {
  setCookie(REFRESH_TOKEN_KEY, "", -1);
};

export const hasRefreshTokenCookie = (): boolean => {
  const token = getRefreshTokenFromCookie();
  return typeof token === "string" && token.trim().length > 0;
};

const createFallbackId = (): string => {
  const partA = Math.random().toString(16).slice(2);
  const partB = Date.now().toString(16);
  return `${partB}-${partA}`;
};

export const getOrCreateFingerprint = (): string => {
  if (!canUseWindow()) return "server";

  const existing = window.localStorage.getItem(FINGERPRINT_KEY);
  if (existing) return existing;

  const fingerprint =
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : createFallbackId();

  window.localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  return fingerprint;
};

export const saveServerFingerprint = (serverHash: string): void => {
  if (!canUseWindow()) return;
  if (!serverHash) return;

  window.localStorage.setItem(FINGERPRINT_KEY, serverHash);
};
