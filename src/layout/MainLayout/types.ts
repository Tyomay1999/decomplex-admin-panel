import type { MenuProps } from "antd";

export type MenuItem = NonNullable<MenuProps["items"]>[number];

export type RouteKey = "dashboard" | "vacancies" | "users" | "events" | "profile";

export type LayoutMode = {
  isMobile: boolean;
  isTablet: boolean;
};

export type SidebarTitles = {
  sidebarTitle: string;
  headerTitle: string;
};
