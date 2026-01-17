import { useCallback } from "react";
import { App as AntdApp } from "antd";
import { useTranslation } from "react-i18next";
import { useRegisterCompanyUserMutation } from "@/services/authApi";
import type { CreateUserFormValues, CreateUserResult } from "../types";

const safeText = (v: unknown): string => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

const trimOrUndef = (v: string | undefined): string | undefined => {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length > 0 ? s : undefined;
};

export const useCreateCompanyUser = (): {
  isLoading: boolean;
  submit: (values: CreateUserFormValues) => Promise<CreateUserResult>;
} => {
  const { t } = useTranslation("common");
  const { message } = AntdApp.useApp();
  const [registerUser, { isLoading }] = useRegisterCompanyUserMutation();

  const submit = useCallback(
    async (values: CreateUserFormValues): Promise<CreateUserResult> => {
      const payload: CreateUserFormValues = {
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        position: trimOrUndef(values.position),
        language: values.language,
      };

      try {
        const data = await registerUser(payload).unwrap();

        message.success(t("users.created", { defaultValue: "User created" }));

        return {
          ok: true,
          message: `${t("users.result", { defaultValue: "Created" })}: id=${data.id}, email=${data.email}, role=${data.role}, companyId=${data.companyId}`,
          data,
        };
      } catch (e: unknown) {
        // message.error(t("common.failed", { defaultValue: "Failed" }));
        return {
          ok: false,
          message: `${t("common.error", { defaultValue: "Error" })}: ${safeText(e)}`,
        };
      }
    },
    [registerUser, t],
  );

  return { isLoading, submit };
};
