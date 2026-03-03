import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { sel } from "../selectors";
import { e2eEnv } from "../env";
import { waitForPageSettled } from "../wait";

export async function loginViaUi(page: Page): Promise<void> {
  const creds = e2eEnv.admin;

  const email = creds?.email ?? "";
  const password = creds?.password ?? "";

  if (email.trim().length === 0 || password.trim().length === 0) {
    throw new Error("E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD are required to run real login e2e");
  }

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await waitForPageSettled(page);

  await expect(page.locator(sel.loginPage)).toBeVisible({ timeout: 15_000 });

  const emailInput = page.locator(sel.loginEmail);
  await expect(emailInput).toBeVisible({ timeout: 15_000 });
  await emailInput.fill(email);

  const passInput = page.locator(sel.loginPassword);
  await expect(passInput).toBeVisible({ timeout: 15_000 });
  await passInput.fill(password);

  const submit = page.locator(sel.loginSubmit);
  await expect(submit).toBeEnabled({ timeout: 15_000 });
  await submit.click();

  await expect(page).not.toHaveURL(/\/login\/?$/, { timeout: 15_000 });
  await expect(page.locator(sel.topbar)).toBeVisible({ timeout: 15_000 });
}
