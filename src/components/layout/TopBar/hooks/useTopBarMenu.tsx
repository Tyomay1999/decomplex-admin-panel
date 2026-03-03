import { useCallback, useMemo } from "react";
import type { MenuProps } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import type { Lang } from "@/i18n";
import { SUPPORTED_LANGS } from "@/i18n";

type TFn = (key: string, opts?: { defaultValue?: string }) => string;

type Params = {
  t: TFn;
  currentLanguage: Lang;
  onChangeLanguage: (lng: Lang) => void;
  isDark: boolean;
  onToggleTheme: (nextIsDark: boolean) => void;
  userEmail: string;
  onRequestLogout: () => void;
};

type MenuItem = NonNullable<MenuProps["items"]>[number];

type Result = {
  items: NonNullable<MenuProps["items"]>;
  onClick: NonNullable<MenuProps["onClick"]>;
};

const isLangKey = (value: string): value is `lang:${Lang}` => {
  return SUPPORTED_LANGS.some((lng) => value === `lang:${lng}`);
};

export const useTopBarMenu = ({
  t,
  currentLanguage,
  onChangeLanguage,
  isDark,
  onToggleTheme,
  userEmail,
  onRequestLogout,
}: Params): Result => {
  const items = useMemo<NonNullable<MenuProps["items"]>>(() => {
    const emailItem: MenuItem = {
      key: "user-email",
      disabled: true,
      label: userEmail,
    };

    const logoutItem: MenuItem = {
      key: "logout",
      danger: true,
      icon: <LogoutOutlined />,
      label: t("common.logout", { defaultValue: "Logout" }),
    };

    return [
      emailItem,
      { type: "divider" },
      ...buildSettingsItems({ t, currentLanguage, isDark }),
      { type: "divider" },
      logoutItem,
    ];
  }, [t, currentLanguage, isDark, userEmail]);

  const onClick = useCallback<NonNullable<MenuProps["onClick"]>>(
    (info) => {
      const key = String(info.key);

      if (key === "logout") {
        onRequestLogout();
        return;
      }

      if (key === "theme:light") {
        onToggleTheme(false);
        return;
      }

      if (key === "theme:dark") {
        onToggleTheme(true);
        return;
      }

      if (isLangKey(key)) {
        const lng = key.slice("lang:".length) as Lang;
        onChangeLanguage(lng);
      }
    },
    [onRequestLogout, onToggleTheme, onChangeLanguage],
  );

  return { items, onClick };
};

const buildSettingsItems = (p: { t: TFn; currentLanguage: Lang; isDark: boolean }): MenuItem[] => {
  const { t, currentLanguage, isDark } = p;

  const language: MenuItem = {
    key: "language",
    label: (
      <span data-testid="topbar-language-submenu">
        {t("language.label", { defaultValue: "Language" })}
      </span>
    ),
    children: [
      {
        key: "lang:en",
        label: (
          <span data-testid="topbar-lang-en">{t("language.en", { defaultValue: "English" })}</span>
        ),
        disabled: currentLanguage === "en",
      },
      {
        key: "lang:ru",
        label: (
          <span data-testid="topbar-lang-ru">{t("language.ru", { defaultValue: "Русский" })}</span>
        ),
        disabled: currentLanguage === "ru",
      },
      {
        key: "lang:hy",
        label: (
          <span data-testid="topbar-lang-hy">{t("language.hy", { defaultValue: "Հայերեն" })}</span>
        ),
        disabled: currentLanguage === "hy",
      },
    ],
  };

  const theme: MenuItem = {
    key: "theme",
    label: (
      <span data-testid="topbar-theme-submenu">{t("theme.label", { defaultValue: "Theme" })}</span>
    ),
    children: [
      {
        key: "theme:light",
        label: (
          <span data-testid="topbar-theme-light">
            {t("theme.light", { defaultValue: "Light" })}
          </span>
        ),
        disabled: !isDark,
      },
      {
        key: "theme:dark",
        label: (
          <span data-testid="topbar-theme-dark">{t("theme.dark", { defaultValue: "Dark" })}</span>
        ),
        disabled: isDark,
      },
    ],
  };

  return [language, theme];
};
