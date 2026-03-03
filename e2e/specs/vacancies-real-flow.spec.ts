import { test, expect } from "@playwright/test";
import { loginViaUi } from "../helpers/auth/loginViaUi";
import { waitForPageSettled } from "../helpers/wait";
import { sel } from "../helpers/selectors";
import { readCreatedVacancyId } from "../helpers/vacancies";

function uniqueTitle(): string {
  return `E2E Vacancy ${Date.now()}`;
}

test("vacancies: create -> details -> back -> applications (real backend)", async ({ page }) => {
  await loginViaUi(page);

  const noCompany = page.getByText("Company is not attached to this user.");
  if (await noCompany.isVisible()) {
    throw new Error(
      "E2E user has no company attached. Provide a company-attached test user to run this flow.",
    );
  }

  await expect(page.locator(sel.vacanciesPage)).toBeVisible({ timeout: 15_000 });

  await page.locator(sel.vacanciesCreateOpen).click();
  await expect(page.locator(sel.vacancyCreatePage)).toBeVisible({ timeout: 15_000 });

  const title = uniqueTitle();

  await page.locator(sel.vacancyTitle).fill(title);
  await page.locator(sel.vacancyLocation).fill("Yerevan");
  await page.locator(sel.vacancyDescription).fill("E2E description");

  const created = page.waitForResponse((r) => {
    if (r.request().method() !== "POST") return false;
    const p = new URL(r.url()).pathname;
    if (!p.endsWith("/vacancies")) return false;
    return r.status() >= 200 && r.status() < 300;
  });

  await page.locator(sel.vacancyCreateSubmit).click();

  const res = await created;
  const raw = await res.json();
  const id = readCreatedVacancyId(raw);

  await page.goto(`/vacancies/${id}`, { waitUntil: "domcontentloaded" });
  await waitForPageSettled(page);

  await expect(page.locator(sel.vacancyDetailsPage)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 4, name: title })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("button", { name: /back/i }).click();
  await expect(page.locator(sel.vacanciesPage)).toBeVisible({ timeout: 15_000 });

  await page.goto(`/vacancies/${id}/applications`, { waitUntil: "domcontentloaded" });
  await waitForPageSettled(page);

  await expect(page.locator(sel.vacancyApplicationsPage)).toBeVisible({ timeout: 15_000 });
});
