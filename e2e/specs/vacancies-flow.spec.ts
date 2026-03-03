import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { sel } from "../helpers/selectors";
import { installMockAuth } from "../helpers/api/mockAuth";
import { installMockVacancies } from "../helpers/api/mockVacancies";
import { waitForPageSettled } from "../helpers/wait";

function uniqueTitle(): string {
  return `E2E Vacancy ${Date.now()}`;
}

async function ensureVacanciesLoaded(page: Page): Promise<void> {
  await expect(page.locator(sel.vacanciesPage)).toBeVisible({ timeout: 15_000 });
}

test("vacancies: create -> details -> back -> applications", async ({ page }) => {
  const apiBaseUrl = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:4100";

  await installMockAuth(page, {
    apiBaseUrl,
    locale: "en",
    user: {
      id: "u-1",
      email: "admin@e2e.dev",
      role: "admin",
      language: "en",
      firstName: "E2E",
      lastName: "Admin",
      userType: "company",
      company: { id: "c_1", name: "Decomplex" },
    },
  });

  await installMockVacancies(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForPageSettled(page);

  await ensureVacanciesLoaded(page);

  await page.locator(sel.vacanciesCreateOpen).click();
  await expect(page.locator(sel.vacancyCreatePage)).toBeVisible({ timeout: 15_000 });

  const title = uniqueTitle();

  await page.locator(sel.vacancyTitle).fill(title);
  await page.locator(sel.vacancyLocation).fill("Yerevan");
  await page.locator(sel.vacancyDescription).fill("E2E description");

  await page.locator(sel.vacancyCreateSubmit).click();

  await expect(page.locator(sel.vacancyDetailsPage)).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /back/i }).click();
  await ensureVacanciesLoaded(page);

  await page.getByRole("button", { name: /view/i }).first().click();
  await expect(page.locator(sel.vacancyDetailsPage)).toBeVisible({ timeout: 15_000 });

  const detailsPath = new URL(page.url()).pathname.replace(/\/$/, "");
  await page.goto(`${detailsPath}/applications`, { waitUntil: "domcontentloaded" });
  await waitForPageSettled(page);

  await expect(page.locator(sel.vacancyApplicationsPage)).toBeVisible({ timeout: 15_000 });
});
