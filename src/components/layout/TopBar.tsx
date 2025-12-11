import React from "react";
import { Space, Select, Switch, Typography } from "antd";
import { GlobalOutlined, BulbOutlined } from "@ant-design/icons";

const { Text } = Typography;

type Props = {
  currentLanguage: string;
  onChangeLanguage: (lng: string) => void;
  isDark: boolean;
  onToggleTheme: (checked: boolean) => void;
  t: (key: string) => string;
};

export const TopBar: React.FC<Props> = ({
  currentLanguage,
  onChangeLanguage,
  isDark,
  onToggleTheme,
  t,
}) => {
  return (
    <header className="app-topbar">
      <Space size="large">
        <Space>
          <GlobalOutlined />
          <Text>{t("language.label")}:</Text>
          <Select
            size="small"
            value={currentLanguage}
            style={{ width: 130 }}
            onChange={onChangeLanguage}
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
            checked={isDark}
            onChange={onToggleTheme}
            checkedChildren={t("theme.dark")}
            unCheckedChildren={t("theme.light")}
          />
        </Space>
      </Space>
    </header>
  );
};
