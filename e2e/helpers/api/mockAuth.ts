import type { Page, Route, Request } from "@playwright/test";
import { apiPatternFromEnv } from "./pattern";
import { corsPreflight, jsonResponse } from "./routeUtils";

type Role = "admin" | "company_manager" | "recruiter" | "user";

export type MockUser = {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
  language?: "en" | "ru" | "hy" | null;
  company?: { id: string; name: string; status?: string | null } | null;
};

type ApiSuccess<T> = { success: true; data: T };

type InstallOptions = {
  user: MockUser;
  accessToken?: string;
  refreshToken?: string;
};

const ACCESS_COOKIE = "dc_accessToken";

function readAuthToken(req: Request): string | null {
  const h = req.headers()["authorization"];
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() ?? null;
}

function hasCookie(req: Request, name: string, value: string): boolean {
  const raw = req.headers()["cookie"] ?? "";
  return raw.split(";").some((p) => {
    const s = p.trim();
    return s.startsWith(`${name}=`) && s.slice(`${name}=`.length) === value;
  });
}

function isAuthed(req: Request, accessToken: string): boolean {
  const token = readAuthToken(req);
  if (token && token === accessToken) return true;
  return hasCookie(req, ACCESS_COOKIE, encodeURIComponent(accessToken));
}

async function setAuthCookies(
  page: Page,
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await page.addInitScript(
    ({ at, rt }) => {
      document.cookie = `dc_accessToken=${encodeURIComponent(at)};path=/;SameSite=Lax`;
      document.cookie = `dc_refreshToken=${encodeURIComponent(rt)};path=/;SameSite=Lax`;
    },
    { at: accessToken, rt: refreshToken },
  );
}

function normalizeApiPath(fullPathname: string): string {
  const apiPrefix = process.env.VITE_API_PREFIX ?? process.env.E2E_API_PREFIX ?? "/api";
  const prefix = apiPrefix.startsWith("/") ? apiPrefix : `/${apiPrefix}`;
  const idx = fullPathname.indexOf(prefix);
  return idx >= 0 ? fullPathname.slice(idx + prefix.length) : fullPathname;
}

function parseJsonObject(raw: string): Record<string, unknown> {
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v === "object" && v !== null && !Array.isArray(v))
      return v as Record<string, unknown>;
    return {};
  } catch {
    return {};
  }
}

function getStringField(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  return typeof v === "string" ? v : null;
}

export async function installMockAuth(page: Page, opts: InstallOptions): Promise<void> {
  const accessToken = opts.accessToken ?? "mock-access-token";
  const refreshToken = opts.refreshToken ?? "mock-refresh-token";
  const user = opts.user;

  await setAuthCookies(page, accessToken, refreshToken);

  const apiPattern = apiPatternFromEnv();

  await page.route(apiPattern, async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method().toUpperCase();

    if (method === "OPTIONS") {
      await corsPreflight(route);
      return;
    }

    const apiPath = normalizeApiPath(url.pathname);

    if (apiPath === "/auth/login" && method === "POST") {
      const data: ApiSuccess<{
        accessToken: string;
        refreshToken: string;
        user: MockUser;
        fingerprintHash?: string;
      }> = { success: true, data: { accessToken, refreshToken, user, fingerprintHash: "mock-fp" } };

      await route.fulfill(jsonResponse(data));
      return;
    }

    if (apiPath === "/auth/refresh" && method === "POST") {
      const data: ApiSuccess<{
        accessToken: string;
        refreshToken?: string;
        user: MockUser;
        fingerprintHash?: string;
      }> = { success: true, data: { accessToken, refreshToken, user, fingerprintHash: "mock-fp" } };

      await route.fulfill(jsonResponse(data));
      return;
    }

    if (apiPath === "/auth/me" && method === "GET") {
      if (!isAuthed(req, accessToken)) {
        await route.fulfill(jsonResponse({ success: false }, 401));
        return;
      }

      const data: ApiSuccess<{ user: MockUser; company: MockUser["company"] }> = {
        success: true,
        data: { user, company: user.company ?? null },
      };

      await route.fulfill(jsonResponse(data));
      return;
    }

    if (apiPath === "/auth/current" && method === "GET") {
      if (!isAuthed(req, accessToken)) {
        await route.fulfill(jsonResponse({ success: false }, 401));
        return;
      }

      const session = { id: "mock-session" };
      const data: ApiSuccess<typeof session> = { success: true, data: session };
      await route.fulfill(jsonResponse(data));
      return;
    }

    if (apiPath === "/auth/logout" && method === "PATCH") {
      const data: ApiSuccess<{ ok: true }> = { success: true, data: { ok: true } };
      await route.fulfill(jsonResponse(data));
      return;
    }

    if (apiPath === "/auth/register/company-user" && method === "POST") {
      if (!isAuthed(req, accessToken)) {
        await route.fulfill(jsonResponse({ success: false }, 401));
        return;
      }

      const raw = req.postData() ?? "{}";
      const body = parseJsonObject(raw);

      const email = getStringField(body, "email") ?? "new@user.com";
      const role = getStringField(body, "role") ?? "recruiter";
      const position = getStringField(body, "position");
      const language = getStringField(body, "language") ?? "en";

      const created = {
        id: `u_${Date.now()}`,
        email: String(email),
        role: String(role),
        position: typeof position === "string" ? position : null,
        language: String(language),
        companyId: user.company?.id ?? "c_1",
      };

      const data: ApiSuccess<typeof created> = { success: true, data: created };
      await route.fulfill(jsonResponse(data));
      return;
    }

    if (!isAuthed(req, accessToken)) {
      await route.fulfill(jsonResponse({ success: false }, 401));
      return;
    }

    await route.fallback();
  });
}
