import { test, expect } from "@playwright/test";
import { resetDbIfConfigured } from "../helpers/api";
import { loginAsRecruiter } from "../helpers/auth";
import { waitForPageSettled } from "../helpers/wait";

test.beforeAll(async ({ request }) => {
  await resetDbIfConfigured(request);
});

test("vacancies: can open applications from list", async ({ request, page }) => {
  await loginAsRecruiter(request, page);

  await page.goto("/vacancies");
  await waitForPageSettled(page);

  await expect(page.getByRole("heading", { level: 4, name: "Vacancies" })).toBeVisible();

  const btn = page.getByRole("button", { name: "Applications" }).first();
  await expect(btn).toBeVisible();
  await btn.click();

  await waitForPageSettled(page);

  await expect(page).toHaveURL(/\/vacancies\/[^/]+\/applications$/);
  await expect(page.getByRole("heading", { level: 4, name: "Applications" })).toBeVisible();

  await expect(page.getByRole("table")).toBeVisible();
});
