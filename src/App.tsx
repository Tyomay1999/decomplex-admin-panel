import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, useLocation } from "react-router-dom";
import { ConfigProvider, theme as antdTheme, App as AntdApp } from "antd";

import { LoginPage } from "@/pages/auth/LoginPage";
import { MainLayout } from "@/layout/MainLayout";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute";
import { AuthBootstrap } from "@/routes/AuthBootstrap";
import { NotificationsHost } from "@/components/NotificationsHost";

import type { Lang } from "@/i18n";
import { toSupportedLang } from "@/i18n";

type ThemeMode = "light" | "dark";

const App: FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("themeMode");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const { i18n } = useTranslation("common");
  const location = useLocation();

  useEffect(() => {
    window.localStorage.setItem("themeMode", themeMode);

    const root = document.documentElement;
    root.classList.remove("theme-ready");
    root.setAttribute("data-theme", themeMode);

    const id = window.setTimeout(() => {
      root.classList.add("theme-ready");
    }, 20);

    return () => window.clearTimeout(id);
  }, [themeMode]);

  const isDark = themeMode === "dark";

  const currentLanguage = useMemo<Lang>(() => {
    return toSupportedLang(i18n.language);
  }, [i18n.language]);

  const handleChangeLanguage = (lng: Lang): void => {
    void i18n.changeLanguage(lng);
  };

  const handleToggleTheme = (checked: boolean): void => {
    setThemeMode(checked ? "dark" : "light");
  };

  const isLoginRoute = location.pathname.endsWith("/login");

  const antdTokens = useMemo(() => {
    return isDark
      ? {
          colorBgBase: "#020617",
          colorBgLayout: "#020617",
          colorBgContainer: "rgba(15, 23, 42, 0.6)",
          colorBgElevated: "#0a1222",

          colorText: "rgba(226, 232, 240, 0.92)",
          colorTextSecondary: "rgba(148, 163, 184, 0.92)",

          colorBorder: "rgba(51, 65, 85, 0.55)",
          colorSplit: "rgba(51, 65, 85, 0.45)",
        }
      : {
          colorBgBase: "#f5f5f5",
          colorBgLayout: "#f5f5f5",
          colorBgContainer: "#ffffff",
          colorBgElevated: "#ffffff",

          colorText: "rgba(15, 23, 42, 0.92)",
          colorTextSecondary: "rgba(30, 41, 59, 0.86)",

          colorBorder: "rgba(15, 23, 42, 0.12)",
          colorSplit: "rgba(15, 23, 42, 0.10)",
        };
  }, [isDark]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: antdTokens,
      }}
    >
      <AntdApp>
        <div className="app-root" data-testid="app-root">
          <NotificationsHost />

          <main
            className={isLoginRoute ? "app-content auth-center" : "app-content"}
            data-testid="app-content"
          >
            <AuthBootstrap>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage isDark={isDark} onToggleTheme={handleToggleTheme} />
                    </PublicOnlyRoute>
                  }
                />

                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <MainLayout
                        currentLanguage={currentLanguage}
                        onChangeLanguage={handleChangeLanguage}
                        isDark={isDark}
                        onToggleTheme={handleToggleTheme}
                      />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AuthBootstrap>
          </main>
        </div>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
