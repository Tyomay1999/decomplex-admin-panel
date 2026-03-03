import type { Page, Route, Request } from "@playwright/test";
import { apiPatternFromEnv } from "./pattern";
import { corsPreflight, jsonResponse } from "./routeUtils";

type VacancyStatus = "active" | "archived";
type JobType = "full_time" | "part_time" | "remote" | "hybrid";

type VacancyDto = {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  status: VacancyStatus;
  jobType: JobType;
  createdAt: string;
  applicationsCount?: number;
};

type ApplicationStatus = "new" | "reviewed" | "accepted" | "rejected";

type VacancyApplicationDto = {
  id: string;
  candidate: { id: string; email: string; name?: string | null };
  status: ApplicationStatus;
  createdAt: string;
};

type ApiSuccess<T> = { success: true; data: T };

type CreateVacancyBody = Partial<{
  title: string;
  description: string;
  location: string | null;
  jobType: JobType;
}>;

function readAuthToken(req: Request): string | null {
  const h = req.headers()["authorization"];
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() ?? null;
}

function isAuthed(req: Request): boolean {
  const token = readAuthToken(req);
  if (token && token.trim().length > 0) return true;

  const cookie = req.headers()["cookie"] ?? "";
  return cookie.includes("dc_accessToken=");
}

function nowIso(): string {
  return new Date().toISOString();
}

function parseCursor(cursor: string | null): number {
  if (!cursor) return 0;
  const n = Number(cursor);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function normalizeApiPathFromUrl(url: URL): string {
  const apiPrefix = process.env.VITE_API_PREFIX ?? process.env.E2E_API_PREFIX ?? "/api";
  const prefix = apiPrefix.startsWith("/") ? apiPrefix : `/${apiPrefix}`;
  const path = url.pathname;
  const idx = path.indexOf(prefix);
  return idx >= 0 ? path.slice(idx + prefix.length) : path;
}

function parseCreateVacancyBody(raw: string): CreateVacancyBody {
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null || Array.isArray(v)) return {};
    const o = v as Record<string, unknown>;

    const title = typeof o.title === "string" ? o.title : undefined;
    const description = typeof o.description === "string" ? o.description : undefined;
    const location =
      typeof o.location === "string" ? o.location : o.location === null ? null : undefined;

    const jobType =
      o.jobType === "full_time" ||
      o.jobType === "part_time" ||
      o.jobType === "remote" ||
      o.jobType === "hybrid"
        ? (o.jobType as JobType)
        : undefined;

    return { title, description, location, jobType };
  } catch {
    return {};
  }
}

export async function installMockVacancies(page: Page): Promise<void> {
  const vacancies: VacancyDto[] = [
    {
      id: "v_1",
      title: "Senior Frontend Engineer",
      description: "Mocked vacancy description",
      location: "Yerevan",
      status: "active",
      jobType: "full_time",
      createdAt: nowIso(),
      applicationsCount: 2,
    },
    {
      id: "v_2",
      title: "QA Automation Engineer",
      description: "Mocked vacancy description",
      location: null,
      status: "active",
      jobType: "remote",
      createdAt: nowIso(),
      applicationsCount: 0,
    },
  ];

  const applicationsByVacancy: Record<string, VacancyApplicationDto[]> = {
    v_1: [
      {
        id: "a_1",
        candidate: { id: "c_1", email: "candidate1@example.test", name: "Candidate One" },
        status: "new",
        createdAt: nowIso(),
      },
      {
        id: "a_2",
        candidate: { id: "c_2", email: "candidate2@example.test", name: "Candidate Two" },
        status: "reviewed",
        createdAt: nowIso(),
      },
    ],
    v_2: [],
  };

  const apiPattern = apiPatternFromEnv();

  await page.route(apiPattern, async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method().toUpperCase();

    if (method === "OPTIONS") {
      await corsPreflight(route);
      return;
    }

    if (!isAuthed(req)) {
      await route.fulfill(jsonResponse({ success: false }, 401));
      return;
    }

    const apiPath = normalizeApiPathFromUrl(url);

    if (apiPath === "/vacancies" && method === "GET") {
      const q = url.searchParams.get("q") ?? "";
      const status = url.searchParams.get("status") as VacancyStatus | null;
      const jobType = url.searchParams.get("jobType") as JobType | null;

      const limit = Number(url.searchParams.get("limit") ?? "20");
      const cursor = url.searchParams.get("cursor");
      const offset = parseCursor(cursor);

      let list = [...vacancies];

      if (q.trim().length > 0) {
        const needle = q.trim().toLowerCase();
        list = list.filter((v) => v.title.toLowerCase().includes(needle));
      }

      if (status) list = list.filter((v) => v.status === status);
      if (jobType) list = list.filter((v) => v.jobType === jobType);

      const slice = list.slice(offset, offset + limit);
      const next = offset + limit < list.length ? String(offset + limit) : null;

      const data: ApiSuccess<{ vacancies: VacancyDto[]; nextCursor: string | null }> = {
        success: true,
        data: { vacancies: slice, nextCursor: next },
      };

      await route.fulfill(jsonResponse(data));
      return;
    }

    if (apiPath === "/vacancies" && method === "POST") {
      const raw = req.postData() ?? "{}";
      const body = parseCreateVacancyBody(raw);

      const created: VacancyDto = {
        id: `v_${Date.now()}`,
        title: (body.title ?? "Untitled").trim(),
        description: (body.description ?? "").trim(),
        location: typeof body.location === "string" ? body.location.trim() : null,
        status: "active",
        jobType: body.jobType ?? "full_time",
        createdAt: nowIso(),
        applicationsCount: 0,
      };

      vacancies.unshift(created);
      applicationsByVacancy[created.id] = [];

      const data: ApiSuccess<VacancyDto> = { success: true, data: created };
      await route.fulfill(jsonResponse(data));
      return;
    }

    const mDetails = apiPath.match(/^\/vacancies\/([^/]+)$/);
    if (mDetails && method === "GET") {
      const id = mDetails[1] ?? "";
      const found = vacancies.find((v) => v.id === id) ?? null;

      if (!found) {
        await route.fulfill(jsonResponse({ success: true, data: { vacancy: null } }, 200));
        return;
      }

      const data: ApiSuccess<{ vacancy: VacancyDto }> = { success: true, data: { vacancy: found } };
      await route.fulfill(jsonResponse(data));
      return;
    }

    const mApps = apiPath.match(/^\/vacancies\/([^/]+)\/applications$/);
    if (mApps && method === "GET") {
      const vacancyId = mApps[1] ?? "";
      const limit = Number(url.searchParams.get("limit") ?? "20");
      const cursor = url.searchParams.get("cursor");
      const offset = parseCursor(cursor);

      const list = applicationsByVacancy[vacancyId] ?? [];
      const slice = list.slice(offset, offset + limit);
      const next = offset + limit < list.length ? String(offset + limit) : null;

      const data: ApiSuccess<{ applications: VacancyApplicationDto[]; nextCursor: string | null }> =
        {
          success: true,
          data: { applications: slice, nextCursor: next },
        };

      await route.fulfill(jsonResponse(data));
      return;
    }

    await route.fallback();
  });
}
