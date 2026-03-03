import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { sel } from "./selectors";

export const waitForThemeReady = async (page: Page): Promise<void> => {
  await page.waitForFunction(() => document.documentElement.classList.contains("theme-ready"));
};

export const waitForAuthBootstrap = async (page: Page): Promise<void> => {
  const loader = page.locator(sel.routeLoader);
  if (await loader.count()) {
    await expect(loader).toBeHidden({ timeout: 30_000 });
  }
};

export const waitForPageSettled = async (page: Page): Promise<void> => {
  await waitForThemeReady(page);
  await waitForAuthBootstrap(page);
};

const msLeft = (startMs: number, totalMs: number): number => {
  const spent = Date.now() - startMs;
  const left = totalMs - spent;
  return left > 0 ? left : 0;
};

export const waitForVacancyDetailsReady = async (page: Page, timeoutMs = 30_000): Promise<void> => {
  const start = Date.now();

  await expect(page.locator(sel.appRoot)).toBeVisible({ timeout: timeoutMs });

  const login = page.locator(sel.loginPage);
  if (await login.isVisible()) {
    throw new Error(`Redirected to /login while waiting for vacancy details. URL: ${page.url()}`);
  }

  const details = page.locator(sel.vacancyDetailsPage);
  if (await details.isVisible()) return;

  const loading = page.locator(sel.vacancyDetailsLoading);
  const notFound = page.locator(sel.vacancyDetailsNotFound);

  const t1 = msLeft(start, timeoutMs);

  await Promise.race([
    details.waitFor({ state: "visible", timeout: t1 }),
    loading.waitFor({ state: "visible", timeout: t1 }),
    notFound.waitFor({ state: "visible", timeout: t1 }),
    login.waitFor({ state: "visible", timeout: t1 }),
  ]);

  if (await login.isVisible()) {
    throw new Error(`Redirected to /login while waiting for vacancy details. URL: ${page.url()}`);
  }

  if (await notFound.isVisible()) {
    throw new Error(`Vacancy not found screen shown on details route. URL: ${page.url()}`);
  }

  if (await details.isVisible()) return;

  const t2 = msLeft(start, timeoutMs);

  await Promise.race([
    details.waitFor({ state: "visible", timeout: t2 }),
    notFound.waitFor({ state: "visible", timeout: t2 }),
    login.waitFor({ state: "visible", timeout: t2 }),
  ]);

  if (await login.isVisible()) {
    throw new Error(`Redirected to /login while waiting for vacancy details. URL: ${page.url()}`);
  }

  if (await notFound.isVisible()) {
    throw new Error(`Vacancy not found screen shown on details route. URL: ${page.url()}`);
  }

  await expect(details).toBeVisible({ timeout: 1_000 });
};
