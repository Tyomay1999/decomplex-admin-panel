import { test, expect } from "@playwright/test";
import { resetDbIfConfigured } from "../helpers/api";
import { loginAsRecruiter } from "../helpers/auth";
import { waitForPageSettled } from "../helpers/wait";
import { openTopbarMenu, clickTopbarMenuItemByText } from "../helpers/ui/topbarMenu";

test.beforeAll(async ({ request }) => {
  await resetDbIfConfigured(request);
});

test("auth: logout from topbar dropdown -> confirm -> redirected to /login", async ({
  request,
  page,
}) => {
  await loginAsRecruiter(request, page);

  await page.goto("/profile");
  await waitForPageSettled(page);

  await expect(page.getByRole("heading", { level: 4, name: "Profile" })).toBeVisible({
    timeout: 15_000,
  });

  await openTopbarMenu(page);
  await clickTopbarMenuItemByText(page, /logout|log out|sign out|выйти/i);

  const modal = page.locator(".ant-modal").first();
  await expect(modal).toBeVisible({ timeout: 15_000 });

  const ok = modal.getByRole("button", { name: /logout|sign out|выйти/i }).first();
  await expect(ok).toBeVisible({ timeout: 15_000 });
  await ok.click();

  await waitForPageSettled(page);

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator("form")).toBeVisible({ timeout: 15_000 });
});
