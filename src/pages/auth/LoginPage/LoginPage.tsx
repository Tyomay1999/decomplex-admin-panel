import { FC, useCallback, useMemo } from "react";
import { Button, Card, Select, Space, Tooltip, Typography } from "antd";
import type { SelectProps } from "antd";
import { useTranslation } from "react-i18next";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

import type { Lang } from "@/i18n";
import { SUPPORTED_LANGS, toSupportedLang } from "@/i18n";

import { useLoginForm } from "./hooks";
import { LoginForm, LoginHeader } from "./components";

type LangOption = { value: Lang; label: string };

interface LoginPageProps {
  isDark: boolean;
  onToggleTheme: (checked: boolean) => void;
}

const { Text } = Typography;

const langLabel: Record<Lang, string> = {
  en: "EN",
  hy: "HY",
  ru: "RU",
};

export const LoginPage: FC<LoginPageProps> = ({ isDark, onToggleTheme }) => {
  const { t, i18n } = useTranslation("common");
  const h = useLoginForm();

  const currentLang = useMemo<Lang>(() => toSupportedLang(i18n.language), [i18n.language]);

  const options = useMemo<LangOption[]>(
    () => SUPPORTED_LANGS.map((value) => ({ value, label: langLabel[value] })),
    [],
  );

  const handleChange = useCallback<SelectProps<Lang>["onChange"]>(
    (value) => {
      void i18n.changeLanguage(value);
    },
    [i18n],
  );

  const handleToggleTheme = useCallback((): void => {
    onToggleTheme(!isDark);
  }, [isDark, onToggleTheme]);

  return (
    <div className="login-page" data-testid="login-page">
      <div className="login-controls">
        <div className="login-lang">
          <Space size={8}>
            <Text className="login-langLabel">
              {t("language.label", { defaultValue: "Language" })}
            </Text>

            <Select<Lang>
              value={currentLang}
              options={options}
              onChange={handleChange}
              size="small"
              className="login-langSelect"
              popupMatchSelectWidth={false}
              variant="filled"
              data-testid="login-lang-select"
            />
          </Space>
        </div>

        <Tooltip
          title={
            isDark
              ? t("theme.light", { defaultValue: "Light" })
              : t("theme.dark", { defaultValue: "Dark" })
          }
          placement="bottom"
        >
          <Button
            type="text"
            className="login-themeBtn"
            aria-label={t("theme.label", { defaultValue: "Theme" })}
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={handleToggleTheme}
            data-testid="login-theme-btn"
          />
        </Tooltip>
      </div>

      <Card className="login-card" styles={{ body: { padding: 22, position: "relative" } }}>
        <LoginHeader title={t("auth.loginTitle")} description={t("app.description")} />
        <LoginForm form={h.form} isLoading={h.isLoading} onFinish={h.onFinish} t={t} />
      </Card>
    </div>
  );
};
