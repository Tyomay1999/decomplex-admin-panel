import { FC } from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import type { LoginFormValues } from "../types";

type Props = {
  form: ReturnType<typeof Form.useForm<LoginFormValues>>[0];
  isLoading: boolean;
  onFinish: (values: LoginFormValues) => Promise<void>;
  t: (key: string, opts?: { defaultValue?: string }) => string;
};

export const LoginForm: FC<Props> = ({ form, isLoading, onFinish, t }) => {
  return (
    <Form<LoginFormValues>
      form={form}
      layout="vertical"
      onFinish={onFinish}
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
          spellCheck={false}
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
          spellCheck={false}
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
  );
};
