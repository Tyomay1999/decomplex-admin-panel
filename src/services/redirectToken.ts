import { setAccessTokenCookie } from "@/services/authHelpers";

export const hydrateAccessTokenFromUrl = (): string | null => {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);

  const queryToken = url.searchParams.get("accessToken");

  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  const hashToken = hashParams.get("accessToken");

  const token = queryToken || hashToken;
  if (!token) return null;

  setAccessTokenCookie(token);

  url.searchParams.delete("accessToken");
  const clean = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "");
  window.history.replaceState({}, "", clean);

  if (url.hash) window.history.replaceState({}, "", clean);

  return token;
};
