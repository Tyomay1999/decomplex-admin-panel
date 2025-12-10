import React from "react";
import { ConfigProvider, theme as antdTheme, Space, Select, Switch, Typography } from "antd";
import { GlobalOutlined, BulbOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { LoginPage } from "./pages/auth/LoginPage";

type ThemeMode = "light" | "dark";

const { Text } = Typography;

const App: React.FC = () => {
  const [themeMode, setThemeMode] = React.useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("themeMode");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const { t, i18n } = useTranslation("common");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("themeMode", themeMode);
    }
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  const isDark = themeMode === "dark";

  const currentLanguage = React.useMemo(() => {
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
        <header className="app-topbar">
          <Space size="large">
            <Space>
              <GlobalOutlined />
              <Text>{t("language.label")}:</Text>
              <Select
                size="small"
                value={currentLanguage}
                style={{ width: 130 }}
                onChange={handleChangeLanguage}
                options={[
                  { value: "en", label: t("language.en") },
                  { value: "ru", label: t("language.ru") },
                  { value: "hy", label: t("language.hy") },
                ]}
              />
            </Space>

            <Space>
              <BulbOutlined />
              <Text>{t("theme.label")}:</Text>
              <Switch
                checked={themeMode === "dark"}
                onChange={handleToggleTheme}
                checkedChildren={t("theme.dark")}
                unCheckedChildren={t("theme.light")}
              />
            </Space>
          </Space>
        </header>

        <main className="app-content">
          <LoginPage />
        </main>
      </div>
    </ConfigProvider>
  );
};

export default App;
