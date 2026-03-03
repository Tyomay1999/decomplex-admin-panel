import { test, expect } from "@playwright/test";
import { sel } from "../helpers/selectors";
import { openLoginPage, selectLoginLang } from "../helpers/pages/login";

test("login: UI renders stable controls", async ({ page }) => {
  await openLoginPage(page);

  await expect(page.locator(sel.loginLangSelect)).toBeVisible();
  await expect(page.locator(sel.loginThemeBtn)).toBeVisible();

  await expect(page.locator(sel.loginEmail)).toBeVisible();
  await expect(page.locator(sel.loginPassword)).toBeVisible();
  await expect(page.locator(sel.loginSubmit)).toBeVisible();
});

test("login: toggles theme and updates html[data-theme]", async ({ page }) => {
  await openLoginPage(page);

  const html = page.locator(sel.html);
  const before = await html.getAttribute("data-theme");

  await page.locator(sel.loginThemeBtn).click();

  await expect
    .poll(async () => (await html.getAttribute("data-theme")) ?? "", { timeout: 5_000 })
    .not.toBe(before ?? "");
});

test("login: language switch changes labels", async ({ page }) => {
  await openLoginPage(page);

  await expect(page.getByText("Language")).toBeVisible();

  await selectLoginLang(page, "RU");

  await expect(page.getByText("Язык")).toBeVisible({ timeout: 10_000 });
});
