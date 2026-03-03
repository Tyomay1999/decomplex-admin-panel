import { test, expect } from "@playwright/test";
import { resetDbIfConfigured } from "../helpers/api";
import { loginAsRecruiter } from "../helpers/auth";
import { waitForPageSettled } from "../helpers/wait";
import { sel } from "../helpers/selectors";
import { openTopbarMenu } from "../helpers/ui/topbarMenu";

test.beforeAll(async ({ request }) => {
  await resetDbIfConfigured(request);
});

const getLocalStorage = async (
  page: import("@playwright/test").Page,
  key: string,
): Promise<string | null> => {
  return await page.evaluate((k) => window.localStorage.getItem(k), key);
};

const closestMenuItem = (locator: import("@playwright/test").Locator) => {
  return locator.locator("xpath=ancestor::*[@role='menuitem'][1]");
};

test("topbar: language switch -> saves i18nextLng and disables selected option", async ({
  request,
  page,
}) => {
  await loginAsRecruiter(request, page);

  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await waitForPageSettled(page);

  await expect(page.locator(sel.topbar)).toBeVisible({ timeout: 15_000 });

  await openTopbarMenu(page);

  await expect(page.locator(sel.topbarLangSubmenu)).toBeVisible({ timeout: 15_000 });
  await page.locator(sel.topbarLangSubmenu).hover();

  await expect(page.locator(sel.topbarLangRu)).toBeVisible({ timeout: 15_000 });
  await page.locator(sel.topbarLangRu).click();

  await expect.poll(async () => (await getLocalStorage(page, "i18nextLng")) ?? "").toMatch(/^ru/i);

  await openTopbarMenu(page);
  await page.locator(sel.topbarLangSubmenu).hover();

  const ruItem = closestMenuItem(page.locator(sel.topbarLangRu));
  await expect(ruItem).toHaveAttribute("aria-disabled", "true");

  await page.reload();
  await waitForPageSettled(page);

  await expect.poll(async () => (await getLocalStorage(page, "i18nextLng")) ?? "").toMatch(/^ru/i);
});
