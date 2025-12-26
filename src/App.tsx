import * as React from "react";
import { FC, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";

import { TopBar } from "./components/layout/TopBar";
import { LoginPage } from "./pages/auth/LoginPage";
import { MainLayout } from "./layout/MainLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicOnlyRoute } from "./routes/PublicOnlyRoute";

type ThemeMode = "light" | "dark";

const App: FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("themeMode");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const { t, i18n } = useTranslation("common");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("themeMode", themeMode);
    }
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  const isDark = themeMode === "dark";

  const currentLanguage = useMemo(() => {
    if (i18n.language.startsWith("ru")) return "ru";
    if (i18n.language.startsWith("hy")) return "hy";
    return "en";
  }, [i18n.language]);

  const handleChangeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
  };

  const handleToggleTheme = (checked: boolean) => {
    setThemeMode(checked ? "dark" : "light");
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <div className="app-root">
        <TopBar
          currentLanguage={currentLanguage}
          onChangeLanguage={handleChangeLanguage}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          t={t}
        />

        <main className="app-content">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </ConfigProvider>
  );
};

export default App;
