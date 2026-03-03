import type { APIRequestContext } from "@playwright/test";
import { e2eEnv } from "./env";

export const apiUrl = (path: string): string => {
  const prefix = e2eEnv.apiPrefix.startsWith("/") ? e2eEnv.apiPrefix : `/${e2eEnv.apiPrefix}`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${e2eEnv.apiBaseUrl}${prefix}${p}`;
};

export const resetDbIfConfigured = async (request: APIRequestContext): Promise<void> => {
  if (!e2eEnv.resetUrl) return;

  const res = await request.post(e2eEnv.resetUrl);
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`E2E reset failed: ${res.status()} ${body}`);
  }
};
