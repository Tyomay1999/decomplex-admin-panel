export type LocaleCode = "en" | "ru" | "hy";

export type UserType = "company" | "candidate";

export type Role = "admin" | "company_manager" | "user";

export type CompanyUserRole = "admin" | "recruiter";

export type CompanyDto = {
  id: string;
  name: string;
  defaultLocale?: LocaleCode | string;
  status?: "active" | "inactive" | string;
};

export type UserDto = {
  id: string;
  email: string;

  role: Role;

  userType?: UserType;
  companyId?: string;

  position?: string | null;
  language?: LocaleCode | string;

  company?: Pick<CompanyDto, "id" | "name"> | null;
};
