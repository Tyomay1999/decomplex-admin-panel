import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  // DashboardOutlined,
  UserOutlined,
  // CalendarOutlined,
  LogoutOutlined,
  ProfileOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import type { MenuItem } from "../types";
import type { Role } from "@/features/auth/types";

type Args = {
  role: Role;
};

const canSeeUsersByRole = (role: Role): boolean => role === "admin" || role === "company_manager";

export const useSidebarMenu = ({ role }: Args): MenuItem[] => {
  const { t, i18n } = useTranslation("common");

  return useMemo(() => {
    const items: MenuItem[] = [
      // { key: "dashboard", icon: <DashboardOutlined />, label: t("nav.dashboard", { defaultValue: "Dashboard" }) },
      {
        key: "vacancies",
        icon: <SolutionOutlined />,
        label: t("nav.vacancies", { defaultValue: "Vacancies" }),
      },
    ];

    if (canSeeUsersByRole(role)) {
      items.push({
        key: "users",
        icon: <UserOutlined />,
        label: t("nav.users", { defaultValue: "Users" }),
      });
    }

    items.push(
      // { key: "events", icon: <CalendarOutlined />, label: t("nav.events", { defaultValue: "Events" }) },
      { type: "divider" },
      {
        key: "profile",
        icon: <ProfileOutlined />,
        label: t("nav.profile", { defaultValue: "Profile" }),
      },
      {
        key: "action:logout",
        icon: <LogoutOutlined />,
        label: t("nav.logout", { defaultValue: "Logout" }),
      },
    );

    return items;
  }, [role, i18n.resolvedLanguage, t]);
};
