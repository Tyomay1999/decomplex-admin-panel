import { test, expect } from "@playwright/test";
import { installMockAuth } from "../helpers/api/mockAuth";
import { installMockVacancies } from "../helpers/api/mockVacancies";

test("smoke: app bootstraps with mocked auth and opens vacancies", async ({ page }) => {
  await installMockAuth(page, {
    user: {
      id: "u_admin",
      email: "admin@decomplex-tech.com",
      role: "admin",
      name: "Admin User",
      language: "en",
      company: { id: "c_1", name: "Decomplex" },
    },
  });

  await installMockVacancies(page);

  await page.goto("/");

  await expect(page.getByRole("heading", { level: 4, name: "Vacancies" })).toBeVisible();
  await expect(page.getByText("Senior Frontend Engineer")).toBeVisible();
});
