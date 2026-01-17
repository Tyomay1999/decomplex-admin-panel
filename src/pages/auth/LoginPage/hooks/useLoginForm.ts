import { useCallback } from "react";
import { Form } from "antd";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/services";
import type { LoginFormValues, LocationState } from "../types";

type Return = {
  form: ReturnType<typeof Form.useForm<LoginFormValues>>[0];
  isLoading: boolean;
  onFinish: (values: LoginFormValues) => Promise<void>;
};

const normalizeFromPath = (value: unknown): string => {
  if (!value || typeof value !== "object") return "/";

  const state = value as LocationState;
  const raw = state.from?.pathname;

  if (typeof raw !== "string") return "/";

  const path = raw.trim();
  if (!path.startsWith("/")) return "/";

  if (path === "/login") return "/";

  return path;
};

export const useLoginForm = (): Return => {
  const [form] = Form.useForm<LoginFormValues>();
  const { i18n } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();

  const [login, { isLoading }] = useLoginMutation();

  const onFinish = useCallback(
    async (values: LoginFormValues): Promise<void> => {
      try {
        const language = i18n.language;
        const rememberUser = Boolean(values.remember);

        await login({
          email: values.email,
          password: values.password,
          language,
          rememberUser,
        }).unwrap();

        const from = normalizeFromPath(location.state);
        navigate(from, { replace: true });
      } catch {
        form.setFieldsValue({ password: "" });
      }
    },
    [form, i18n.language, location.state, login, navigate],
  );

  return { form, isLoading, onFinish };
};
