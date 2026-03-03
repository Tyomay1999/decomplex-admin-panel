import { test, expect } from "@playwright/test";
import { resetDbIfConfigured } from "../helpers/api";
import { loginAsAdmin } from "../helpers/auth";
import { waitForPageSettled } from "../helpers/wait";
import { sel } from "../helpers/selectors";
import { uniqueEmail } from "../helpers/data/unique";
import { waitForPost, assertOkOrThrow } from "../helpers/api/waitFor";

test.beforeAll(async ({ request }) => {
  await resetDbIfConfigured(request);
});

test("users: admin can create a recruiter", async ({ request, page }) => {
  await loginAsAdmin(request, page);

  await page.goto("/users");
  await waitForPageSettled(page);

  await expect(page.locator(sel.usersPage)).toBeVisible({ timeout: 15_000 });

  await page.locator(sel.userEmail).fill(uniqueEmail());
  await page.locator(sel.userPassword).fill("TestPassword123!");

  const createBtn = page.locator(sel.userCreateSubmit);
  await expect(createBtn).toBeEnabled({ timeout: 30_000 });

  const created = waitForPost(page, "/auth/register/company-user", 45_000);

  await createBtn.click();

  const res = await created;
  await assertOkOrThrow(res, "Create recruiter (UI)");

  await expect(page.locator(sel.userEmail)).toHaveValue("");
});
