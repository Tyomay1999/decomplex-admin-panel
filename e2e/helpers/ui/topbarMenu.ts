import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { sel } from "../selectors";

export const openTopbarMenu = async (page: Page): Promise<void> => {
  await expect(page.locator(sel.topbar)).toBeVisible({ timeout: 15_000 });

  const trigger = page.locator(sel.topbarUserTrigger);
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  await trigger.click();

  const menu = page.locator(".ant-dropdown .ant-dropdown-menu");
  await expect(menu).toBeVisible({ timeout: 15_000 });
};

export const clickTopbarMenuItemByText = async (page: Page, re: RegExp): Promise<void> => {
  const item = page.getByRole("menuitem").filter({ hasText: re }).first();
  await expect(item).toBeVisible({ timeout: 15_000 });
  await item.click();
};
