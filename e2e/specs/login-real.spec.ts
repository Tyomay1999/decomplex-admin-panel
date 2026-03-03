import { test, expect } from "@playwright/test";
import { loginViaUi } from "../helpers/auth/loginViaUi";
import { waitForPageSettled } from "../helpers/wait";
import { sel } from "../helpers/selectors";

test("auth: login via UI works", async ({ page }) => {
  await loginViaUi(page);

  await waitForPageSettled(page);

  await expect(page.locator(sel.topbar)).toBeVisible();
});
