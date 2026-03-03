import { e2eEnv } from "../env";
export type RoutePattern = RegExp;

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function apiPatternFromEnv(): RoutePattern {
  const base = e2eEnv.apiBaseUrl;
  const prefix = e2eEnv.apiPrefix;

  if (!base) throw new Error("VITE_API_BASE_URL (or E2E_API_BASE_URL) is required for e2e mocks");

  const safeBase = escapeRegExp(base);
  const safePrefix = escapeRegExp(prefix.startsWith("/") ? prefix : `/${prefix}`);

  return new RegExp(`^${safeBase}${safePrefix}/`);
}
