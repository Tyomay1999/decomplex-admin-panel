import { test, expect } from "@playwright/test";
import { resetDbIfConfigured } from "../helpers/api";
import { waitForPageSettled } from "../helpers/wait";

test.beforeAll(async ({ request }) => {
  await resetDbIfConfigured(request);
});

test("smoke: anonymous -> redirected to /login", async ({ page }) => {
  await page.goto("/");

  await waitForPageSettled(page);

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator("form")).toBeVisible();
});
