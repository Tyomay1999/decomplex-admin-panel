import { test, expect } from "@playwright/test";
import { resetDbIfConfigured } from "../helpers/api";
import { loginAsRecruiter } from "../helpers/auth";
import { waitForPageSettled } from "../helpers/wait";

test.beforeAll(async ({ request }) => {
  await resetDbIfConfigured(request);
});

test("profile: authenticated -> profile shows title", async ({ request, page }) => {
  await loginAsRecruiter(request, page);

  await page.goto("/profile");
  await waitForPageSettled(page);

  await expect(page.getByRole("heading", { level: 4, name: "Profile" })).toBeVisible();
});
