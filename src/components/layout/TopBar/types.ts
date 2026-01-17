import type { Lang } from "@/i18n";

export type TopBarUser = {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

export type TopBarProps = {
  brand: string;

  currentLanguage: Lang;
  onChangeLanguage: (lng: Lang) => void;

  isDark: boolean;
  onToggleTheme: (nextIsDark: boolean) => void;

  user: TopBarUser;

  isMobile: boolean;

  onRequestLogout: () => void;

  sidebarToggle?: {
    collapsed: boolean;
    onToggle: () => void;
  };
};
