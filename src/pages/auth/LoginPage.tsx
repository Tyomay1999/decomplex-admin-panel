import React from "react";
import { Card, Form, Input, Button, Checkbox, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { useLoginMutation } from "../../services/authApi";

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember?: boolean;
}

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const { t } = useTranslation("common");

  const [login, { isLoading }] = useLoginMutation();

  const handleFinish = async (values: LoginFormValues) => {
    try {
      const result = await login({
        email: values.email,
        password: values.password,
      }).unwrap();

      console.log("Login response:", result);
      message.success(t("messages.loginSuccess"));
    } catch (error: FetchBaseQueryError | SerializedError) {
      let errMessage = t("messages.loginError");

      if ("data" in error && error.data) {
        const backendMessage = (error.data as { message?: string })?.message;
        if (backendMessage) errMessage = backendMessage;
      }

      if ("error" in error && typeof error.error === "string") {
        errMessage = error.error;
      }

      message.error(errMessage);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <Title level={3} style={{ marginBottom: 4 }}>
            {t("auth.loginTitle")}
          </Title>
          <Text type="secondary">{t("app.description")}</Text>
        </div>

        <Form<LoginFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ remember: true }}
        >
          <Form.Item
            label={t("auth.emailLabel")}
            name="email"
            rules={[
              { required: true, message: t("validation.emailRequired") },
              { type: "email", message: t("validation.emailInvalid") },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder={t("auth.emailPlaceholder")}
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            label={t("auth.passwordLabel")}
            name="password"
            rules={[{ required: true, message: t("validation.passwordRequired") }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder={t("auth.passwordPlaceholder")}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>{t("auth.rememberMe")}</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginTop: 12 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
              {t("auth.loginButton")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
