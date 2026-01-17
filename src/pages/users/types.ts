import type { CompanyUserRole, RegisterCompanyUserResponseData } from "@/services/authApi";

export type LanguageCode = "en" | "ru" | "hy";

export type CreateUserFormValues = {
  email: string;
  password: string;
  role: CompanyUserRole;
  position?: string;
  language: LanguageCode;
};

export type CreateUserResult = {
  ok: boolean;
  message: string;
  data?: RegisterCompanyUserResponseData;
};
