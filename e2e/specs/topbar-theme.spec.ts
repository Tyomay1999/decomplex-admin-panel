import { test, expect } from "@playwright/test";
import { resetDbIfConfigured } from "../helpers/api";
import { loginAsRecruiter } from "../helpers/auth";
import { waitForPageSettled } from "../helpers/wait";
import { sel } from "../helpers/selectors";
import { openTopbarMenu } from "../helpers/ui/topbarMenu";

test.beforeAll(async ({ request }) => {
  await resetDbIfConfigured(request);
});

const getThemeMode = async (page: import("@playwright/test").Page): Promise<string | null> => {
  return await page.evaluate(() => window.localStorage.getItem("themeMode"));
};

const getDomTheme = async (page: import("@playwright/test").Page): Promise<string | null> => {
  return await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
};

test("topbar: theme switch -> persists themeMode and updates html[data-theme]", async ({
  request,
  page,
}) => {
  await loginAsRecruiter(request, page);

  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await waitForPageSettled(page);

  await expect(page.locator(sel.topbar)).toBeVisible({ timeout: 15_000 });

  await openTopbarMenu(page);

  await expect(page.locator(sel.topbarThemeSubmenu)).toBeVisible({ timeout: 15_000 });
  await page.locator(sel.topbarThemeSubmenu).hover();

  await expect(page.locator(sel.topbarThemeDark)).toBeVisible({ timeout: 15_000 });
  await page.locator(sel.topbarThemeDark).click();

  await expect.poll(async () => (await getThemeMode(page)) ?? "").toBe("dark");
  await expect.poll(async () => (await getDomTheme(page)) ?? "").toBe("dark");

  await openTopbarMenu(page);
  await page.locator(sel.topbarThemeSubmenu).hover();

  await expect(page.locator(sel.topbarThemeLight)).toBeVisible({ timeout: 15_000 });
  await page.locator(sel.topbarThemeLight).click();

  await expect.poll(async () => (await getThemeMode(page)) ?? "").toBe("light");
  await expect.poll(async () => (await getDomTheme(page)) ?? "").toBe("light");

  await page.reload();
  await waitForPageSettled(page);

  await expect.poll(async () => (await getThemeMode(page)) ?? "").toBe("light");
  await expect.poll(async () => (await getDomTheme(page)) ?? "").toBe("light");
});
