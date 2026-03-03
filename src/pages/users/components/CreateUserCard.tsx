import { FC, useCallback, useMemo } from "react";
import { Button, Card, Form, Grid, Input, Select, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { CompanyUserRole } from "@/services/authApi";
import type { CreateUserFormValues, CreateUserResult, LanguageCode } from "../types";

const { useBreakpoint } = Grid;
const { Text } = Typography;

type Props = {
  isLoading: boolean;
  onSubmit: (values: CreateUserFormValues) => Promise<CreateUserResult>;
};

type Option<T extends string> = { value: T; label: string };

const normalizeLang = (lng: string): LanguageCode => {
  if (lng.startsWith("ru")) return "ru";
  if (lng.startsWith("hy")) return "hy";
  return "en";
};

export const CreateUserCard: FC<Props> = ({ isLoading, onSubmit }) => {
  const { t, i18n } = useTranslation("common");
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [form] = Form.useForm<CreateUserFormValues>();

  const defaultLanguage = useMemo<LanguageCode>(
    () => normalizeLang(i18n.language),
    [i18n.language],
  );

  const initialValues = useMemo<CreateUserFormValues>(
    () => ({
      email: "",
      password: "",
      role: "recruiter",
      position: "",
      language: defaultLanguage,
    }),
    [defaultLanguage],
  );

  const roleOptions = useMemo<Array<Option<CompanyUserRole>>>(
    () => [
      { value: "admin", label: t("users.roles.admin", { defaultValue: "Admin" }) },
      { value: "recruiter", label: t("users.roles.recruiter", { defaultValue: "Recruiter" }) },
    ],
    [t],
  );

  const languageOptions = useMemo<Array<Option<LanguageCode>>>(
    () => [
      { value: "en", label: t("users.languages.en", { defaultValue: "English (en)" }) },
      { value: "ru", label: t("users.languages.ru", { defaultValue: "Russian (ru)" }) },
      { value: "hy", label: t("users.languages.hy", { defaultValue: "Armenian (hy)" }) },
    ],
    [t],
  );

  const handleFinish = useCallback(
    async (values: CreateUserFormValues): Promise<void> => {
      const res = await onSubmit(values);

      if (res.ok) {
        form.resetFields();
        form.setFieldsValue(initialValues);
      }
    },
    [onSubmit, form, initialValues],
  );

  return (
    <Card className="usersCard" styles={{ body: { padding: isMobile ? 14 : 16 } }}>
      <Space orientation="vertical" size={8} style={{ width: "100%" }}>
        <div style={{ minWidth: 0 }}>
          <Text style={{ fontWeight: 700 }}>
            {t("users.actions.create", { defaultValue: "Create user" })}
          </Text>
          <div>
            <Text type="secondary">
              {t("users.create.subtitle", {
                defaultValue: "Invite an admin or recruiter to your company workspace.",
              })}
            </Text>
          </div>
        </div>

        <Form<CreateUserFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={initialValues}
        >
          <Form.Item
            name="email"
            label={t("users.fields.email", { defaultValue: "Email" })}
            rules={[
              {
                required: true,
                message: t("users.validation.email", { defaultValue: "Email is required" }),
              },
              {
                type: "email",
                message: t("validation.emailInvalid", { defaultValue: "Invalid email" }),
              },
            ]}
          >
            <Input
              size="large"
              placeholder="email@example.com"
              autoComplete="email"
              data-testid="user-email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t("users.fields.password", { defaultValue: "Password" })}
            rules={[
              {
                required: true,
                message: t("users.validation.password", { defaultValue: "Password is required" }),
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="••••••••"
              autoComplete="new-password"
              data-testid="user-password"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label={t("users.fields.role", { defaultValue: "Role" })}
            rules={[{ required: true }]}
          >
            <Select<CompanyUserRole> size="large" options={roleOptions} />
          </Form.Item>

          <Form.Item
            name="position"
            label={t("users.fields.position", { defaultValue: "Position (optional)" })}
          >
            <Input
              size="large"
              placeholder={t("users.placeholders.position", {
                defaultValue: "Owner, HR, Recruiter...",
              })}
            />
          </Form.Item>

          <Form.Item
            name="language"
            label={t("users.fields.language", { defaultValue: "Language" })}
            rules={[{ required: true }]}
          >
            <Select<LanguageCode> size="large" options={languageOptions} />
          </Form.Item>

          <div className="usersCardFooter">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block={isMobile}
              size="large"
              data-testid="user-create-submit"
            >
              {t("users.actions.create", { defaultValue: "Create user" })}
            </Button>
          </div>
        </Form>
      </Space>
    </Card>
  );
};
