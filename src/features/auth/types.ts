export type UserType = "company";

export type Role = "admin" | "company_manager" | "recruiter" | "user";

export type CompanyDto = {
  id: string;
  name: string;
  defaultLocale?: string;
  status?: "active" | "inactive";
};

export type UserDto = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  company?: CompanyDto | null;
};

export type CurrentUserDto = {
  id: string;
  email: string;
  role: Exclude<Role, "user">;
  language: string;
  position: string | null;
  companyId: string;
  userType: UserType;
};

export type CurrentSessionDto = {
  userType: UserType;
  user: CurrentUserDto;
  company: CompanyDto;
};

export type MeResponseData = UserDto | { user: UserDto; company?: CompanyDto | null };
