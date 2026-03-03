import type { Route } from "@playwright/test";

export function jsonResponse(
  data: unknown,
  status = 200,
): { status: number; contentType: string; body: string } {
  return { status, contentType: "application/json", body: JSON.stringify(data) };
}

export function corsPreflight(route: Route): Promise<void> {
  return route.fulfill({
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "access-control-allow-headers":
        "content-type,authorization,accept-language,x-client-fingerprint",
    },
  });
}
