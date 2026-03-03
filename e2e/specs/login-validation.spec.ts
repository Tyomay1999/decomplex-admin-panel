import { test, expect } from "@playwright/test";
import { resetDbIfConfigured } from "../helpers/api";
import { waitForPageSettled } from "../helpers/wait";
import { sel } from "../helpers/selectors";

test.beforeAll(async ({ request }) => {
  await resetDbIfConfigured(request);
});

test("login: shows validation errors for empty fields and invalid email", async ({ page }) => {
  await page.goto("/login");
  await waitForPageSettled(page);

  await expect(page.locator(sel.loginPage)).toBeVisible();

  const submit = page.locator(sel.loginSubmit);
  await expect(submit).toBeVisible();

  await submit.click();

  await expect(page.locator(".ant-form-item-explain-error")).toHaveCount(2);

  await page.locator(sel.loginEmail).fill("not-an-email");
  await page.locator(sel.loginPassword).fill("x");

  await submit.click();

  await expect(page.locator(".ant-form-item-explain-error")).toHaveCount(1);
});
