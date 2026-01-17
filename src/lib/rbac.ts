import type { CurrentSessionDto, Role } from "@/features/auth/types";

export type Permission =
  | "nav.dashboard"
  | "nav.users"
  | "nav.vacancies"
  | "nav.profile"
  | "nav.logout"
  | "nav.events";

const rolePermissions: Record<Role, readonly Permission[]> = {
  admin: ["nav.dashboard", "nav.users", "nav.vacancies", "nav.profile", "nav.logout", "nav.events"],
  company_manager: [
    "nav.dashboard",
    "nav.users",
    "nav.vacancies",
    "nav.profile",
    "nav.logout",
    "nav.events",
  ],
  recruiter: ["nav.vacancies", "nav.profile", "nav.logout"],
};

export const hasPermission = (session: CurrentSessionDto | null, perm: Permission): boolean => {
  if (!session) return false;
  const perms = rolePermissions[session.user.role] ?? [];
  return perms.includes(perm);
};
