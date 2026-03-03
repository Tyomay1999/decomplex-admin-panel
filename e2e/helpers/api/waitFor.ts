import type { Page, Response } from "@playwright/test";

const normalizeEndsWith = (v: string): string => {
  const s = v.trim();
  if (s.length === 0) return s;
  const withSlash = s.startsWith("/") ? s : `/${s}`;
  return withSlash.endsWith("/") ? withSlash.slice(0, -1) : withSlash;
};

const normalizePathname = (pathname: string): string => {
  const p = pathname.trim();
  return p.endsWith("/") && p.length > 1 ? p.slice(0, -1) : p;
};

export const waitForPost = (
  page: Page,
  pathnameEndsWith: string,
  timeout = 45_000,
): Promise<Response> => {
  const target = normalizeEndsWith(pathnameEndsWith);

  return page.waitForResponse(
    (r) => {
      if (r.request().method() !== "POST") return false;

      const p = normalizePathname(new URL(r.url()).pathname);
      return p.endsWith(target);
    },
    { timeout },
  );
};

export const assertOkOrThrow = async (res: Response, label: string): Promise<void> => {
  if (res.ok()) return;

  let body = "";
  try {
    body = await res.text();
  } catch {
    body = "<failed to read body>";
  }

  throw new Error(
    `${label} failed: HTTP ${res.status()} ${res.url()}\n` + `Response body:\n${body}`,
  );
};
