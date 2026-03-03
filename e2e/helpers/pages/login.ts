import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { sel } from "../selectors";
import { waitForPageSettled } from "../wait";

export async function openLoginPage(page: Page): Promise<void> {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await waitForPageSettled(page);
  await expect(page.locator(sel.loginPage)).toBeVisible({ timeout: 15_000 });
}

export async function openLoginLangDropdown(page: Page): Promise<void> {
  const select = page.locator(sel.loginLangSelect);
  await expect(select).toBeVisible({ timeout: 15_000 });
  await select.click();
  await expect(page.locator(".ant-select-dropdown")).toBeVisible({ timeout: 10_000 });
}

export async function selectLoginLang(page: Page, code: "EN" | "RU" | "HY"): Promise<void> {
  await openLoginLangDropdown(page);

  await page.locator(".ant-select-item-option").filter({ hasText: code }).first().click();
}
