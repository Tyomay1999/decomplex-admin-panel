import { describe, it, expect } from "vitest";
import { hasPermission } from "@/lib/rbac";
import type { CurrentSessionDto } from "@/features/auth/types";
import type { Permission } from "@/lib/rbac";

const makeSession = (role: CurrentSessionDto["user"]["role"]): CurrentSessionDto => ({
  userType: "company",
  user: {
    id: "u1",
    email: "a@b.com",
    role,
    language: "en",
    position: null,
    companyId: "c1",
    userType: "company",
  },
  company: { id: "c1", name: "Acme" },
});

describe("rbac.hasPermission", () => {
  it("returns false when session is null", () => {
    expect(hasPermission(null, "nav.dashboard")).toBe(false);
  });

  it("admin has dashboard and users permissions", () => {
    const session = makeSession("admin");
    expect(hasPermission(session, "nav.dashboard")).toBe(true);
    expect(hasPermission(session, "nav.users")).toBe(true);
  });

  it("recruiter does not have users permission but has vacancies", () => {
    const session = makeSession("recruiter");
    expect(hasPermission(session, "nav.users")).toBe(false);
    expect(hasPermission(session, "nav.vacancies")).toBe(true);
  });

  it("company_manager has events permission", () => {
    const session = makeSession("company_manager");
    expect(hasPermission(session, "nav.events")).toBe(true);
  });

  it("recruiter does not have events permission", () => {
    const session = makeSession("recruiter");
    expect(hasPermission(session, "nav.events")).toBe(false);
  });

  it("permission type stays constrained", () => {
    const session = makeSession("admin");
    const perm: Permission = "nav.profile";
    expect(hasPermission(session, perm)).toBe(true);
  });
});
