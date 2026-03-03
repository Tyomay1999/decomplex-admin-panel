import type { Page } from "@playwright/test";

export const toApplicationsFromDetailsUrl = async (page: Page): Promise<void> => {
  const detailsPath = new URL(page.url()).pathname.replace(/\/$/, "");
  await page.goto(`${detailsPath}/applications`, { waitUntil: "domcontentloaded" });
};
