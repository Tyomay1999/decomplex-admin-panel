import { setAccessTokenCookie } from "@/services";

export const hydrateAccessTokenFromUrl = (): string | null => {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);

  const queryToken = url.searchParams.get("accessToken");

  const hashRaw = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  const hashParams = new URLSearchParams(hashRaw);
  const hashToken = hashParams.get("accessToken");

  const token = queryToken || hashToken;
  if (!token) return null;

  setAccessTokenCookie(token);

  url.searchParams.delete("accessToken");
  hashParams.delete("accessToken");

  const search = url.searchParams.toString();
  const hash = hashParams.toString();

  const clean = `${url.pathname}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
  window.history.replaceState({}, "", clean);

  return token;
};
